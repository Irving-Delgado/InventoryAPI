import express, { Router } from "express";
import {paymentController} from "./payments.controller";

export const paymentsRouter = Router();

paymentsRouter.post("/webhook", express.raw({type: 'application/json'}), paymentController.handleWebhook);

paymentsRouter.post("/create-payment-intent", paymentController.createPaymentIntent);
