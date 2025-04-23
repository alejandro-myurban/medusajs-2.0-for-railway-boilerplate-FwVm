import { ReactNode } from "react";
import { MedusaError } from "@medusajs/framework/utils";
import { InviteUserEmail, INVITE_USER, isInviteUserData } from "./invite-user";
import {
  OrderPlacedTemplate,
  ORDER_PLACED,
  isOrderPlacedTemplateData,
} from "./order-placed";
import {
  isNewTemplateData,
  WORKSHOP_STATUS,
  WorkshopStatus,
} from "./workshop-state";
import ProductStatus, {
  isProductStatusData,
  PRODUCT_STATUS,
} from "./product-status-change";
import OrderPlacedAdminTemplate, {
  isOrderPlacedAdminTemplateData,
  ORDER_PLACED_ADMIN,
} from "./order-placed-admin";

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  WORKSHOP_STATUS,
  PRODUCT_STATUS,
  ORDER_PLACED_ADMIN,
} as const;

export type EmailTemplateType = keyof typeof EmailTemplates;

export function generateEmailTemplate(
  templateKey: string,
  data: unknown
): ReactNode {
  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`
        );
      }
      return <InviteUserEmail {...data} />;

    case EmailTemplates.ORDER_PLACED:
      if (!isOrderPlacedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED}"`
        );
      }
      return <OrderPlacedTemplate {...data} />;

    case EmailTemplates.ORDER_PLACED_ADMIN:
      if (!isOrderPlacedAdminTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED_ADMIN}"`
        );
      }
      return <OrderPlacedAdminTemplate {...data} />;

    case EmailTemplates.WORKSHOP_STATUS:
      if (!isNewTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.WORKSHOP_STATUS}"`
        );
      }
      return <WorkshopStatus {...data} />;

    case EmailTemplates.PRODUCT_STATUS:
      if (!isProductStatusData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.PRODUCT_STATUS}"`
        );
      }
      return <ProductStatus {...data} />;

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      );
  }
}

export { InviteUserEmail, OrderPlacedTemplate };
