import { Request, Response } from "express";
import OrderLocation, {
  IOrderLocationDocument,
} from "../models/orderLocation.model.js";
import DeliveryOrder, {
  CourierService,
} from "../models/deliveryOrder.model.js";
import DeliveryMan, {
  IDeliveryManDocument,
} from "../models/deliveryMan.model.js";
import { OrderLocationData } from "../validators/orderLocation.validation.js";

// Enum for delivery options
export enum DeliveryOption {
  Local = 1,
  Courier = 2, // Changed from Pathao to generic Courier
}

// Interface for order location response
interface OrderLocationResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Interface for error response
interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Interface for query parameters in getOrderLocationByOrderId
interface GetOrderLocationQuery {
  orderId?: string;
}

// Interface for query parameters in getInternalDeliveryOrders
interface GetInternalDeliveryOrdersQuery {
  page?: string;
  limit?: string;
  search?: string;
}

// Interface for aggregated order from DeliveryOrder model
interface AggregatedOrder {
  orderId: string;
  orderName: string;
  fulfillmentId: string;
  consignmentId: string;
  customerId: string;
  lastEventStatus: string | null;
}

// Interface for combined order with delivery info
interface CombinedOrder extends AggregatedOrder {
  internalDeliveryType: number;
  deliveryManData: {
    name: string;
    phone_number: string;
  } | null;
}

// Interface for pagination info
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  searchQuery: string | null;
}

// Interface for internal delivery orders response
interface InternalDeliveryOrdersResponse {
  success: boolean;
  data?: CombinedOrder[];
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

// Interface for OrderLocation lean document (from database query)
interface OrderLocationLean {
  order_id: string;
  internalDeliveryType: number;
  deliveryOption: number;
  storeId?: number;
}

// Interface for DeliveryMan lean document (from database query)
interface DeliveryManLean {
  order_id: string;
  name: string;
  phone_number: string;
}

export const createOrderLocation = async (
  req: Request<{}, {}, OrderLocationData>,
  res: Response<OrderLocationResponse | ErrorResponse>
): Promise<Response> => {
  try {
    const { order_id, deliveryOption, storeId, internalDeliveryType } =
      req.body;

    if (!order_id || !deliveryOption) {
      return res.status(400).json({
        success: false,
        message: "order_id and delivery option are required.",
      });
    }

    if (
      ![DeliveryOption.Local, DeliveryOption.Courier].includes(deliveryOption)
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery option must be 1 (Local) or 2 (Courier).",
      });
    }

    if (deliveryOption === DeliveryOption.Courier && !storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID is required for Courier delivery.",
      });
    }

    if (deliveryOption === DeliveryOption.Local && !internalDeliveryType) {
      return res.status(400).json({
        success: false,
        message: "Internal Delivery Type is required for Local delivery.",
      });
    }

    const updatePayload: Partial<IOrderLocationDocument> = {
      order_id,
      deliveryOption,
      storeId:
        deliveryOption === DeliveryOption.Courier && typeof storeId === "number"
          ? storeId
          : undefined,
      internalDeliveryType:
        deliveryOption === DeliveryOption.Local && internalDeliveryType != null
          ? internalDeliveryType
          : undefined,
    };

    const orderLocation = await OrderLocation.findOneAndUpdate(
      { order_id },
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean<OrderLocationLean>();

    return res.status(200).json({
      success: true,
      message: "Order location created/updated successfully.",
      data: orderLocation,
    });
  } catch (error) {
    console.error("Error in createOrderLocation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export const getOrderLocationByOrderId = async (
  req: Request<{}, {}, {}, GetOrderLocationQuery>,
  res: Response
): Promise<Response> => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required." });
    }

    const orderLocation: IOrderLocationDocument | null =
      await OrderLocation.findOne({ order_id: orderId });

    if (!orderLocation) {
      return res.status(404).json({ message: "Order location not found." });
    }

    return res.status(200).json({ data: orderLocation });
  } catch (error) {
    console.error("Error fetching order location:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getInternalDeliveryOrders = async (
  req: Request<{}, {}, {}, GetInternalDeliveryOrdersQuery>,
  res: Response<InternalDeliveryOrdersResponse>
): Promise<Response> => {
  const { page = "1", limit = "10", search = "" } = req.query;

  try {
    const pageNum: number = parseInt(page, 10);
    const limitNum: number = parseInt(limit, 10);
    const skip: number = (pageNum - 1) * limitNum;

    // Build match query for search
    const searchMatch = search
      ? {
          orderName: {
            $regex: search,
            $options: "i" as const, // case-insensitive
          },
        }
      : {};

    // Query DeliveryOrder collection directly (no more unwinding arrays)
    const orders: AggregatedOrder[] =
      await DeliveryOrder.aggregate<AggregatedOrder>([
        {
          $match: {
            storeId: 1, // TODO: need to replace this with store url or store shopify id
            courierService: CourierService.INTERNAL, // Filter for internal delivery only
            ...searchMatch,
          },
        },
        {
          $project: {
            orderId: 1,
            orderName: 1,
            fulfillmentId: 1,
            consignmentId: 1,
            customerId: 1,
            lastEventStatus: {
              $cond: {
                if: {
                  $and: [
                    { $isArray: "$events" },
                    { $gt: [{ $size: "$events" }, 0] },
                  ],
                },
                then: {
                  $getField: {
                    field: "status",
                    input: { $arrayElemAt: ["$events", -1] },
                  },
                },
                else: null,
              },
            },
          },
        },
        {
          $sort: { createdAt: -1 }, // Sort by most recent first
        },
        {
          $skip: skip,
        },
        {
          $limit: limitNum,
        },
      ]);

    // Extract order_ids from delivery orders
    const orderIds: string[] = orders.map((order) => order.orderId);

    // Fetch matching OrderLocation data where deliveryOption is 1 (Local)
    const orderLocations: OrderLocationLean[] = await OrderLocation.find({
      order_id: { $in: orderIds },
      deliveryOption: DeliveryOption.Local,
    })
      .select("order_id internalDeliveryType -_id")
      .lean<OrderLocationLean[]>();

    // Fetch matching DeliveryMan data
    const deliveryMenData: DeliveryManLean[] = await DeliveryMan.find({
      order_id: { $in: orderIds },
    })
      .select("order_id name phone_number -_id")
      .lean<DeliveryManLean[]>();

    // Create lookup maps
    const orderLocationMap: Record<string, number> = orderLocations.reduce(
      (acc: Record<string, number>, location: OrderLocationLean) => {
        acc[location.order_id] = location.internalDeliveryType;
        return acc;
      },
      {} as Record<string, number>
    );

    const deliveryManMap: Record<
      string,
      { name: string; phone_number: string }
    > = deliveryMenData.reduce(
      (
        acc: Record<string, { name: string; phone_number: string }>,
        delivery: DeliveryManLean
      ) => {
        acc[delivery.order_id] = {
          name: delivery.name,
          phone_number: delivery.phone_number,
        };
        return acc;
      },
      {} as Record<string, { name: string; phone_number: string }>
    );

    // Combine the data - only include orders that have matching OrderLocation with deliveryOption: 1
    const combinedOrders: CombinedOrder[] = orders
      .filter((order: AggregatedOrder) =>
        orderLocationMap.hasOwnProperty(order.orderId)
      )
      .map(
        (order: AggregatedOrder): CombinedOrder => ({
          ...order,
          internalDeliveryType: orderLocationMap[order.orderId],
          deliveryManData: deliveryManMap[order.orderId] || null,
        })
      );

    // Get total count for pagination info (with search filter applied)
    const totalOrderLocations: number = await DeliveryOrder.countDocuments({
      storeId: 1,
      courierService: CourierService.INTERNAL,
      orderId: { $in: orderIds },
      ...searchMatch,
    });

    const totalPages: number = Math.ceil(totalOrderLocations / limitNum);

    return res.status(200).json({
      success: true,
      data: combinedOrders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalOrderLocations,
        itemsPerPage: limitNum,
        searchQuery: search || null,
      },
    });
  } catch (error) {
    console.error("Error fetching internal delivery orders:", error);
    const errorMessage: string =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: errorMessage,
    });
  }
};
