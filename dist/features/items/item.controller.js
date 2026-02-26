"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsController = void 0;
const items_service_1 = require("./items.service");
exports.itemsController = {
    async create(req, res) {
        const created = await items_service_1.itemsService.create(req.body);
        return res.status(201).json(created);
    },
    async list(_req, res) {
        const items = await items_service_1.itemsService.list();
        return res.json(items);
    },
    async getById(req, res) {
        console.log(req);
        const item = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        return res.json(item);
    },
    async update(req, res) {
        const itemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await items_service_1.itemsService.update(itemId, req.body);
        return res.json(updated);
    }
};
