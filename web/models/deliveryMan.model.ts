import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for the delivery man document
export interface IDeliveryMan {
  order_id: string;
  name: string;
  phone_number: string;
}

// Interface for the delivery man document with Mongoose methods
export interface IDeliveryManDocument extends IDeliveryMan, Document {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema definition
const deliveryManSchema = new Schema<IDeliveryManDocument>(
  {
    order_id: { type: String, required: true },
    name: { type: String, required: true },
    phone_number: { type: String, required: true },
  },
  {
    timestamps: true, // Optional: adds createdAt and updatedAt fields
  }
);

// Model
const DeliveryMan: Model<IDeliveryManDocument> =
  mongoose.model<IDeliveryManDocument>("deliveryMan", deliveryManSchema);

export default DeliveryMan;
