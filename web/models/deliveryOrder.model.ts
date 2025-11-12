import mongoose, { Document, Schema, Model } from "mongoose";

// Enum for courier services
export enum CourierService {
  PATHAO = "PATHAO",
  REDX = "REDX",
  STEADFAST = "STEADFAST",
  ECOURIER = "ECOURIER",
  INTERNAL = "INTERNAL",
}

// Interface for event
export interface IEvent {
  happenedAt: Date;
  status: string;
  description?: string;
}

// Interface for delivery order
export interface IDeliveryOrder {
  storeId: number;
  shopifyStoreUrl: string;
  courierService: CourierService;

  // Order information (from Shopify)
  orderId: string;
  orderName: string;
  customerId: string;

  // Consignment information (from courier service)
  consignmentId: string; // From courier service (not unique across services)
  fulfillmentId: string; // Shopify fulfillment ID

  // Event tracking
  events: IEvent[];

  createdAt: Date;
}

// Interface for delivery order document with Mongoose methods
export interface IDeliveryOrderDocument extends IDeliveryOrder, Document {
  _id: mongoose.Types.ObjectId; // This is our unique identifier for each consignment
  updatedAt: Date;
}

// Event sub-schema
const eventSchema = new Schema<IEvent>(
  {
    happenedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { _id: false }
);

// Main delivery order schema
const deliveryOrderSchema = new Schema<IDeliveryOrderDocument>(
  {
    storeId: {
      type: Number,
      required: true,
      index: true,
    },
    shopifyStoreUrl: {
      type: String,
      required: true,
    },
    courierService: {
      type: String,
      enum: Object.values(CourierService),
      required: true,
      index: true,
    },

    // Order information
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    orderName: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },

    // Consignment information
    consignmentId: {
      type: String,
      required: true,
      index: true,
    },
    fulfillmentId: {
      type: String,
      required: true,
      unique: true, // Shopify fulfillment ID is unique
      index: true,
    },

    // Events
    events: {
      type: [eventSchema],
      default: [],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound indexes for common queries
deliveryOrderSchema.index({ storeId: 1, courierService: 1 });
deliveryOrderSchema.index(
  { courierService: 1, consignmentId: 1 },
  { unique: true }
); // Consignment ID unique per courier
deliveryOrderSchema.index({ storeId: 1, createdAt: -1 }); // For listing orders by store

// Model
const DeliveryOrder: Model<IDeliveryOrderDocument> =
  mongoose.model<IDeliveryOrderDocument>("DeliveryOrder", deliveryOrderSchema);

export default DeliveryOrder;
