import { Request, Response } from "express";
import { itemsService } from "./items.service";

export const itemsController = {
  async create(req: Request, res: Response) {
    const created = await itemsService.create(req.body);
    return res.status(201).json(created);
  },

  async list(_req: Request, res: Response) {
    const items = await itemsService.list();
    return res.json(items);
  },
  async getById(req: Request, res: Response) {
    console.log(req)
    const item = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    return res.json(item);
  }
};