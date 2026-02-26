import { Router } from "express";
import { itemsController } from "./item.controller";

export const itemsRouter = Router();

itemsRouter.post("/", itemsController.create);
itemsRouter.get("/", itemsController.list);
itemsRouter.get("/:id", itemsController.getById);
itemsRouter.put("/:id", itemsController.update);