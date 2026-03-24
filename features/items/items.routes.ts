import { Router } from "express";
import { itemsController } from "./item.controller";
import { authenticate } from "../../common/middleware/authenticate";
import { requireRole } from "../../common/middleware/requiredRole";

export const itemsRouter = Router();

itemsRouter.post("/", authenticate, requireRole("ADMIN"), itemsController.create);
itemsRouter.get("/", itemsController.list);
itemsRouter.get("/:id", itemsController.getById);
itemsRouter.put("/:id", authenticate, requireRole("ADMIN"), itemsController.update);
itemsRouter.delete("/:id",authenticate, requireRole("ADMIN"), itemsController.delete);