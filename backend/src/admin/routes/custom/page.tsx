import { useState } from "react";
import {
  DataTable,
  useDataTable,
  createDataTableColumnHelper,
  createDataTableCommandHelper,
  DataTableRowSelectionState,
  Heading,
  StatusBadge,
} from "@medusajs/ui";
import { toast } from "@medusajs/ui";
import { sdk } from "../../lib/sdk";
import { useQuery } from "@tanstack/react-query";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ShoppingCart } from "@medusajs/icons";

export const config = defineRouteConfig({
  label: "Orders",
  icon: ShoppingCart,
});

const OrdersPage = () => {
  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>(
    {}
  );

  // Modificar la consulta para incluir el cliente y otros datos relevantes
  const { data, isLoading, refetch } = useQuery({
    queryFn: () =>
      sdk.admin.order.list({
        fields: "customer.*,shipping_address,items,metadata,created_at,total",
        // También puedes incluir otros parámetros como:
        // limit: 50,
        // offset: 0,
      }),
    queryKey: [["orders"]],
  });

  const orders = data?.orders || [];
  console.log("Órdenes completas:", orders);

  const columnHelper = createDataTableColumnHelper<any>();
  const thumbnailColumn = columnHelper.accessor("items", {
    id: "thumbnail",
    header: "Thumbnail",
    cell: (info) => {
      const items = info.getValue();
      if (!items || items.length === 0) return null;

      // Limitar a 3 thumbnails
      const maxImages = 3;
      const thumbnailsToShow = items.slice(0, maxImages);

      return (
        <div className="flex items-center flex-wrap justify-center py-2 px-2 gap-1">
          {thumbnailsToShow.map((item, index) => (
            <img
              key={`${item.id}_${index}`}
              src={item.thumbnail}
              alt={`Item ${item.product_handle + 1}`}
              className="w-10 h-10 object-cover rounded"
            />
          ))}
          {items.length > maxImages && (
            <span className="text-sm">+{items.length - maxImages}</span>
          )}
        </div>
      );
    },
  });

  const columns = [
    columnHelper.select(),
    thumbnailColumn,

    // Si existe el cliente después de expandir la consulta
    columnHelper.accessor("customer", {
      header: "Cliente",
      cell: (info) => {
        const customer = info.getValue();
        return customer
          ? `${customer.first_name || ""} ${customer.last_name || ""} (${
              customer.email || "Sin email"
            })`
          : "Sin cliente";
      },
    }),
    // Añadir una columna para mostrar el primer ítem (como vista previa)
    columnHelper.accessor("items", {
      id: "items",
      header: "Artículos",
      cell: (info) => {
        const items = info.getValue();
        if (!items || items.length === 0) return "Sin artículos";

        return (
          <div className="flex flex-col gap-1">
            {items.map((item, index) => (
              <span key={`${item.id || index}`}>
                {item.title} <strong>({item.quantity})</strong>
              </span>
            ))}
          </div>
        );
      },
    }),
    // columnHelper.accessor("status", {
    //   header: "Estado",
    //   cell: (info) => info.getValue(),
    // }),
    columnHelper.accessor("payment_status", {
      header: "Pago",
      cell: (info) => {
        const payment = info.getValue();
        if (payment === "captured") {
          return <StatusBadge color="green">Pago Capturado</StatusBadge>;
        } else if (payment === "authorized") {
          return <StatusBadge color="orange">Pago Autorizado</StatusBadge>;
        }
      },
    }),
    columnHelper.accessor("fulfillment_status", {
      header: "Envío",
      cell: (info) => {
        const fulfillment = info.getValue();
        if (fulfillment === "delivered") {
          return <StatusBadge color="green">Entregado</StatusBadge>;
        } else if (fulfillment === "not_fulfilled") {
          return <StatusBadge color="orange">Pendiente</StatusBadge>;
        }
      },
    }),
    columnHelper.accessor("total", {
      header: "Total",
      cell: (info) => {
        const total = info.getValue();
        return total ? `${total} €` : "N/A";
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha",
      cell: (info) => {
        const date = info.getValue();
        return date ? new Date(date).toLocaleString("es-ES") : "N/A";
      },
    }),
    // Si necesitas depurar datos
    columnHelper.accessor(
      (row) => {
        return row.metadata && row.metadata.workshop_status_display
          ? row.metadata.workshop_status_display
          : null;
      },
      {
        header: "Estado taller",
        id: "workshop_status",
        cell: (info) => {
          const status = info.getValue();
          if (status) {
            return <StatusBadge color="red">{status}</StatusBadge>;
          } else {
            return <StatusBadge color="green">Preparado</StatusBadge>;
          }
        },
      }
    ),
  ];

  const commandHelper = createDataTableCommandHelper();
  const commands = [
    commandHelper.command({
      label: "Procesar órdenes",
      shortcut: "P",
      action: async (selection) => {
        const orderIds = Object.keys(selection);
        console.log("IDs seleccionados convertidos:", orderIds);
        sdk.client
          .fetch("/admin/orders/process-batch", {
            method: "POST",
            body: {
              ids: orderIds,
            },
          })
          .then(() => {
            toast.success("Órdenes procesadas correctamente");
            refetch();
          })
          .catch(() => {
            toast.error("Error al procesar las órdenes");
          });
      },
    }),
    // Puedes añadir más comandos aquí
  ];

  const table = useDataTable({
    columns,
    data: orders || [],
    commands,
    onRowClick(event, row) {},

    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection,
    },
    getRowId: (row) => row.id,
    // Usa el id de la orden
  });

  return (
    <div className="p-8 max-w-[1280px] mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Órdenes</h1>
      </div>
      <DataTable instance={table}>
        <DataTable.Toolbar>
          <Heading>
            Selecciona las ordenes y pulsa "P" para procesarlas.
          </Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.CommandBar
          selectedLabel={(count) => `${count} seleccionadas`}
        />
      </DataTable>
    </div>
  );
};

export default OrdersPage;
