// src/subscribers/order-next-steps.ts
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { Modules } from "@medusajs/framework/utils";
import {
  IOrderModuleService,
  INotificationModuleService,
} from "@medusajs/framework/types";

/**
 * Después de que la orden se cree (normal o COD), dispara:
 *  - stock await si hace backorder sin stock
 *  - o producción (vinilos/baterías) si no
 */
export default async function handleOrderNextSteps({
  event: { name, data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderService = container.resolve<IOrderModuleService>(Modules.ORDER);
  const eventBus = container.resolve(Modules.EVENT_BUS);
  const query = container.resolve("query");

  // 1) Obtener la orden
  const order = await orderService.retrieveOrder(data.id, {
    relations: ["items"],
  });
  if (!order) {
    console.error(`Order ${data.id} not found`);
    return;
  }

  // 2) Check backorder + sin stock
  let needsStock = false;
  for (const item of order.items) {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      filters: [{ field: "id", operator: "=", value: item.variant_id }],
      fields: ["allow_backorder", "inventory_items"],
    });
    const v = variants[0];
    if (v?.allow_backorder && v.inventory_items.length === 0) {
      needsStock = true;
      break;
    }
  }

  if (needsStock) {
    // dispara el flujo de espera de stock
    await eventBus.emit({
      name: "order.status_stock_await",
      data: {
        id: order.id,
        status: "espera_stock",
      },
    });
  } else {
    // sin backorder, dispara producción según tipos en la orden
    const mapEvt: Record<
      string,
      { name: string; status: string; type: string }
    > = {
      Vinilos: {
        name: "order.vinyl_production_requested",
        status: "produccion_vinilos",
        type: "vinyl",
      },
      Baterias: {
        name: "order.battery_production_requested",
        status: "produccion_baterias",
        type: "battery",
      },
    };

    // para cada tipo único presente:
    for (const productType of Array.from(
      new Set(order.items.map((i) => i.product_type))
    )) {
      const cfg = mapEvt[productType];
      if (cfg) {
        await eventBus.emit({
          name: cfg.name,
          data: {
            id: order.id,
            status: cfg.status,
            type: cfg.type,
          },
        });
      }
    }
  }
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.cod_order_placed"],
};
