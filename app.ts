import { itemsRouter } from './features/items/items.routes';
import express, { Request, Response } from 'express';
import { paymentsRouter } from './features/payments/payments.routes';
import { paymentController } from './features/payments/payments.controller';


export const createApp = () => {
    const app = express();

    app.post("/payments/webhook",
        express.raw({ type: "application/json" }),
        paymentController.handleWebhook
    );

    app.use(express.json());

    interface HealthResponse {
        status: string;
    }

    app.use('/health', (req: Request, res: Response<HealthResponse>) => {
        res.json({ status: 'ok' });
    });

    app.use("/items", itemsRouter);
    app.use("/payments", paymentsRouter);

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
    
    return app;
}