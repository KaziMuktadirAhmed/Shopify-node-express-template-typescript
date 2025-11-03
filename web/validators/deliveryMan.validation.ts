import Joi from "joi";

// Interface for the delivery man data structure
export interface DeliveryManData {
  order_id: string;
  name: string;
  phone_number: string;
}

// Validation schema
export const deliveryManValidationSchema = Joi.object<DeliveryManData>({
  order_id: Joi.string().required().messages({
    "string.empty": "Order ID is required",
    "any.required": "Order ID is required",
  }),

  name: Joi.string().required().min(2).messages({
    "string.empty": "Delivery man name is required",
    "any.required": "Delivery man name is required",
    "string.min": "Name must be at least 2 characters long",
  }),

  phone_number: Joi.string()
    .required()
    .trim()
    .pattern(/^[+]?[\d\s\-()]+$/)
    .messages({
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
      "string.pattern.base": "Please enter a valid phone number",
    }),
});
