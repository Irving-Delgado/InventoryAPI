import { Router } from 'express';
import { orderController } from './order.controler';
import { authenticate } from "../../common/middleware/authenticate";

export const orderRouter = Router();

orderRouter.post("/", authenticate, orderController.create);
orderRouter.get("/", authenticate, orderController.listByUser);
orderRouter.get("/:id", authenticate, orderController.getById);