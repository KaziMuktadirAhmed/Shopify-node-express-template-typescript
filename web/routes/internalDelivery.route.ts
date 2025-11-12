import express from "express";
import {
  assignDeliveryMan,
  updateDeliveryStatus,
} from "../controllers/internalDelivery.controller.js";
import validationMiddleware from "../middlewares/validation.middleware.js";
import { deliveryManValidationSchema } from "../validators/deliveryMan.validation.js";

const router = express.Router();

router.post(
  "/assign-delivery-man",
  validationMiddleware(deliveryManValidationSchema),
  assignDeliveryMan
);
router.post("/update-delivery-status", updateDeliveryStatus);

export default router;
