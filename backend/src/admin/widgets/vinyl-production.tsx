// src/admin/widgets/vinyl-production.tsx
import React, { useState } from "react";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Button, toast } from "@medusajs/ui";
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types";

const VinylProductionWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartProduction = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/admin/orders/${data.id}/production/vinyl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al iniciar producción");
      }

      toast.success("Producción de vinilos iniciada");
      // opcional: recarga para actualizar el widget u otros datos
      window.location.reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-4">
      <p className="inter-base-regular mb-4">
        ¿Quieres pasar este pedido al estado de{" "}
        <strong>Producción de Vinilos</strong>?
      </p>
      <Button
        variant="primary"
        size="small"
        onClick={handleStartProduction}
        isLoading={isLoading}
      >
        Iniciar producción de vinilos
      </Button>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.after",
});

export default VinylProductionWidget;
