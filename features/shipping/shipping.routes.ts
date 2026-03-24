import { Router } from "express";
import { ShippingController } from "../shipping/shipping.controller";
import { authenticate } from "../../common/middleware/authenticate";

export const shippingRouter = Router();

shippingRouter.get("/", authenticate, ShippingController.create);
shippingRouter.post("/", authenticate, ShippingController.list);
shippingRouter.get("/:id", authenticate, ShippingController.getById);