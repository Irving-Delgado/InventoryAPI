import express from 'express';
import { itemsRouter } from './features/items/items.routes';
import { Request, Response } from 'express';


export const createApp = () => {
    const app = express();

    app.use(express.json());

    interface HealthResponse {
        status: string;
    }

    app.use('/health', (req: Request, res: Response<HealthResponse>) => {
        res.json({ status: 'ok' });
    });

    app.use("/items", itemsRouter);
    

    return app;
}