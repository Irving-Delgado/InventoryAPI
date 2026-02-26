"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsRouter = void 0;
const express_1 = require("express");
const item_controller_1 = require("./item.controller");
exports.itemsRouter = (0, express_1.Router)();
exports.itemsRouter.post("/", item_controller_1.itemsController.create);
exports.itemsRouter.get("/", item_controller_1.itemsController.list);
exports.itemsRouter.get("/:id", item_controller_1.itemsController.getById);
