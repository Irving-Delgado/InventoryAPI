import { itemsRouter } from './features/items/items.routes';
import express, { Request, Response } from 'express';
import { paymentsRouter } from './features/payments/payments.routes';
import { paymentController } from './features/payments/payments.controller';
import { authRouter } from './features/auth/auth.routes';
import { orderRouter } from './features/orders/order.routes';
import { errorHandler } from "./common/middleware/errorHandler";

import cors from "cors";
import helmet from "helmet";


export const createApp = () => {
    const app = express();

    app.post("/payments/webhook",
        express.raw({ type: "application/json" }),
        paymentController.handleWebhook
    );

    app.use(express.json());
    app.use(helmet());
    
    app.use(cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE"]
    }))
    
    interface HealthResponse {
        status: string;
    }
    
    app.use('/health', (req: Request, res: Response<HealthResponse>) => {
        res.json({ status: 'ok' });
    });
    
    app.use("/items", itemsRouter);
    app.use("/payments", paymentsRouter);
    app.use("/auth", authRouter);
    app.use("/orders", orderRouter);
    
    app.get("/success", (req, res) => {
        res.json({
            message: "payment success redirect hit",
            query: req.query,
        });
    });
    
    app.get("/cancel", (_req, res) => {
        res.json({
            message: "payment cancelled",
        });
    });
    app.use(errorHandler);
    
    return app;
}