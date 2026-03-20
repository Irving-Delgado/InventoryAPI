import { Router } from "express";
import {paymentController} from "./payments.controller";
import { authenticate } from "../../common/middleware/authenticate";

export const paymentsRouter = Router();

paymentsRouter.post("/create-checkout-session", authenticate, paymentController.createCheckoutSession);