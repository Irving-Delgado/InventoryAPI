import { Router } from "express";
import {paymentController} from "./payments.controller";

export const paymentsRouter = Router();

paymentsRouter.post("/create-checkout-session", paymentController.createCheckoutSession);
