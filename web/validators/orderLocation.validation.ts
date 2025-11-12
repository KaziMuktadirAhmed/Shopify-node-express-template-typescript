import Joi from "joi";

// Interface for order location data
export interface OrderLocationData {
  order_id: string;
  deliveryOption: number;
  storeId?: number | null;
  internalDeliveryType?: number | null;
}

// Validation schema
export const orderLocationSchema = Joi.object<OrderLocationData>({
  order_id: Joi.string().required().messages({
    "any.required": "Order ID is required",
    "string.empty": "Order ID cannot be empty",
  }),

  deliveryOption: Joi.number().required().messages({
    "any.required": "Delivery option is required",
    "number.base": "Delivery option must be a number",
  }),

  storeId: Joi.number().optional().allow(null, "").messages({
    "number.base": "Store ID must be a number",
  }),

  internalDeliveryType: Joi.number().optional().allow(null, "").messages({
    "number.base": "Internal delivery type must be a number",
  }),
});
