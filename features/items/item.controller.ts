import { Request, Response } from "express";
import { itemsService } from "./items.service";

export const itemsController = {
  async create(req: Request, res: Response) {
    try{
      const created = await itemsService.create(req.body);
      return res.status(201).json(created);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const items = await itemsService.list(page, limit);
      return res.json(items);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },
  async getById(req: Request, res: Response) {
     try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await itemsService.getById(id);

      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      return res.status(200).json(item);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },
  async update(req: Request, res: Response) {
    try {
      const itemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await itemsService.update(itemId, req.body);
      return res.json(updated);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },
  async delete(req: Request, res: Response){
    try {
      const itemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await itemsService.delete(itemId);
      return res.status(204).send();
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
};