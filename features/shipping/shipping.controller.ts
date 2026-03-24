import { Request, Response } from "express";
import { ShippingService } from "./shipping.service";

export const ShippingController  = {
    async create(req: Request, res: Response) {
        try{
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const created = await ShippingService.create(req.user.id, req.body);
            return res.status(201).json(created);
        }catch(e: any){
            return res.status(500).json({ error: e.message });
        }
    },
    async list(req: Request, res: Response){
        try{
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const listed = await ShippingService.list(req.user.id);
            return res.status(200).json(listed);
        }catch(e: any){
            return res.status(500).json({ error: e.message });
        }
    },
    async getById(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const address = await ShippingService.getById(id);
            if (!address) return res.status(404).json({ error: "Address not found" });
            return res.status(200).json(address);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    },
    async update(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const updated = await ShippingService.update(id, req.body);
            return res.status(200).json(updated);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    },
    async delete(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            await ShippingService.delete(id);
            return res.status(204).send();
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }
}
