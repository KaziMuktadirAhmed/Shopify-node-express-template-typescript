import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for the order location document
export interface IOrderLocation {
  order_id: string;
  deliveryOption: number;
  storeId?: number;
  internalDeliveryType?: number;
}

// Interface for the order location document with Mongoose methods
export interface IOrderLocationDocument extends IOrderLocation, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const orderLocationSchema = new Schema<IOrderLocationDocument>(
  {
    order_id: {
      type: String,
      required: true,
    },
    deliveryOption: {
      type: Number,
      required: true,
    },
    storeId: {
      type: Number,
    },
    internalDeliveryType: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Model
const OrderLocation: Model<IOrderLocationDocument> =
  mongoose.model<IOrderLocationDocument>("OrderLocation", orderLocationSchema);

export default OrderLocation;
