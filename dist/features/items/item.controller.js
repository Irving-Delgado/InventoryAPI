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
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const item = await items_service_1.itemsService.getById(id);
            if (!item) {
                return res.status(404).json({ error: "Item not found" });
            }
            return res.status(200).json(item);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async update(req, res) {
        const itemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await items_service_1.itemsService.update(itemId, req.body);
        return res.json(updated);
    }
};
