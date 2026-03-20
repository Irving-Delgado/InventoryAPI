import { Request, Response } from "express";
import { orderService } from "./order.service";
import { log } from "node:console";

export const orderController = {
    async create(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const created = await orderService.create({...req.body, userId: req.user.id});
            return res.status(201).json(created);
        }catch (e: any) {   
            console.log(e);
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    async listByUser(req: Request, res: Response) {
        try { 
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const list = await orderService.listByUser(req.user.id);
            return res.json(list);
        } catch (e: any) {
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    async getById(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const order = await orderService.getById(id);

            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }

            return res.status(200).json(order);
        } catch (e: any) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}