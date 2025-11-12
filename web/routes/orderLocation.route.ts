import express, { Router } from "express";
// import {
//   createOrderLocation,
//   getOrderLocationByOrderId,
//   getInternalDeliveryOrders,
// } from "../controllers/orderLocation.js";
import validationMiddleware from "../middlewares/validation.middleware.js";
import { orderLocationSchema } from "../validators/orderLocation.validation.js";

const router: Router = express.Router();

router.post(
  "/create",
  validationMiddleware(orderLocationSchema),
  () => {}
  // createOrderLocation
);

router.get(
  "/get",
  () => {}
  // getOrderLocationByOrderId
);

router.get(
  "/internal-delivery-orders",
  () => {}
  // getInternalDeliveryOrders
);

export default router;
