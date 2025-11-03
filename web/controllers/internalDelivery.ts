import { Request, Response } from "express";
import DeliveryMan from "../models/deliveryMan.js";
// import { shopifyEventHandler } from "../services/fulfillmentEvent.js";

// Interface for delivery man assignment request
interface AssignDeliveryManRequest {
  order_id: string;
  name: string;
  phone_number: string;
}

// Interface for delivery status update request
interface UpdateDeliveryStatusRequest {
  fulfillmentEvent: string;
  fulfillment_id: string;
  order_id: string;
  storeID: string;
  customerInfo?: Record<string, any>;
}

// Interface for success response
interface SuccessResponse {
  success: boolean;
  message: string;
}

// Interface for error response
interface ErrorResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

export const assignDeliveryMan = async (
  req: Request<{}, {}, AssignDeliveryManRequest>,
  res: Response
): Promise<void> => {
  const { order_id, name, phone_number } = req.body;

  try {
    await DeliveryMan.findOneAndUpdate(
      { order_id },
      { name, phone_number },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Delivery man assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning delivery man:", error);
    res.status(500).json({
      error: "Internal server error",
    } as ErrorResponse);
  }
};

export const updateDeliveryStatus = async (
  req: Request<{}, {}, UpdateDeliveryStatusRequest>,
  res: Response
): Promise<Response> => {
  try {
    const {
      fulfillmentEvent,
      fulfillment_id,
      order_id,
      storeID,
      customerInfo = {},
    } = req.body;

    // const response = await shopifyEventHandler(
    //   fulfillmentEvent,
    //   customerInfo,
    //   fulfillment_id,
    //   order_id,
    //   storeID
    // );

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
    } as SuccessResponse);
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update delivery status",
    } as ErrorResponse);
  }
};
