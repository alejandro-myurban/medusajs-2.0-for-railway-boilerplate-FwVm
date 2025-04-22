import { useMemo, useState } from "react";
import {
  DataTable,
  useDataTable,
  createDataTableColumnHelper,
  createDataTableCommandHelper,
  DataTableRowSelectionState,
  Heading,
  StatusBadge,
  DataTablePaginationState,
  Skeleton,
} from "@medusajs/ui";
import { toast } from "@medusajs/ui";
import { sdk } from "../../lib/sdk";
import { useQuery } from "@tanstack/react-query";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ShoppingCart } from "@medusajs/icons";
import { useNavigate } from "react-router-dom";

export const config = defineRouteConfig({
  label: "Pedidos",
  icon: ShoppingCart,
});

const OrdersPage = () => {
  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>(
    {}
  );

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: 50, // Aumentar el tamaño de página
    pageIndex: 0,
  });

  const offset = useMemo(() => {
    return pagination.pageIndex * pagination.pageSize;
  }, [pagination]);

  const navigate = useNavigate();
  // Modificar la consulta para incluir el cliente y otros datos relevantes
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryFn: () =>
      sdk.admin.order.list({
        fields: "customer.*,shipping_address,items,metadata,created_at,total",
        // También puedes incluir otros parámetros como:
        limit: pagination.pageSize,
        offset: offset,
      }),
    queryKey: [["orders", pagination.pageIndex, pagination.pageSize]],
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
        console.log("Estado de producción:", row);
        return row.metadata && row.metadata.production_status_display
          ? row.metadata.production_status_display
          : null;
      },
      {
        header: "Producción",
        id: "production_status",
        cell: (info) => {
          const status = info.getValue();
          
          if (status) {
            return <StatusBadge color="red">{status}</StatusBadge>;
          } else {
            return <StatusBadge color="orange">En Espera</StatusBadge>;
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
    onRowClick(event, row) {
      navigate(`/orders/${row.id}`);
    },
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection,
    },
    rowCount: data?.count || 0,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
    // Usa el id de la orden
  });

  return (
    <div className="p-8 max-w-[1280px] mx-auto">
      <DataTable instance={table}>
        {isLoading ? (
          <div className="w-full">
            <div className="mb-4">
              <Skeleton className="h-10 w-[1200px]" /> {/* Título "Órdenes" */}
            </div>

            {/* Skeleton para la barra de herramientas */}
            <Skeleton className="w-full h-12 mb-4" />

            {/* Skeleton para el encabezado de la tabla */}
            <div className="w-full flex mb-2">
              <Skeleton className="w-10 h-10 mr-2" />{" "}
              {/* Checkbox de selección */}
              <Skeleton className="flex-1 h-10 mr-2" /> {/* Thumbnail */}
              <Skeleton className="flex-1 h-10 mr-2" /> {/* Cliente */}
              <Skeleton className="flex-1 h-10 mr-2" /> {/* Artículos */}
              <Skeleton className="flex-1 h-10 mr-2" /> {/* Pago */}
              <Skeleton className="flex-1 h-10 mr-2" /> {/* Envío */}
              <Skeleton className="flex-1 h-10" /> {/* Estado taller */}
            </div>

            {/* Skeletons para las filas de datos */}
            {Array.from({ length: pagination.pageSize }).map((_, i) => (
              <div key={i} className="w-full flex mb-2">
                <Skeleton className="w-10 h-16 mr-2" />{" "}
                {/* Checkbox de selección */}
                <Skeleton className="flex-1 h-16 mr-2" /> {/* Thumbnail */}
                <Skeleton className="flex-1 h-16 mr-2" /> {/* Cliente */}
                <Skeleton className="flex-1 h-16 mr-2" /> {/* Artículos */}
                <Skeleton className="flex-1 h-16 mr-2" /> {/* Pago */}
                <Skeleton className="flex-1 h-16 mr-2" /> {/* Envío */}
                <Skeleton className="flex-1 h-16" /> {/* Estado taller */}
              </div>
            ))}

            {/* Skeleton para la paginación */}
            <Skeleton className="w-full h-10 mt-4" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Órdenes</h1>
            </div>
            <DataTable.Toolbar>
              <Heading>
                Selecciona las ordenes y pulsa "P" para procesarlas.
              </Heading>
            </DataTable.Toolbar>
            <DataTable.Table />
            <DataTable.Pagination />
          </>
        )}
        <DataTable.CommandBar
          selectedLabel={(count) => `${count} seleccionadas`}
        />
      </DataTable>
    </div>
  );
};

export default OrdersPage;
