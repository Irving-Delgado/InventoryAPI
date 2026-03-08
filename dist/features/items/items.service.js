"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsService = void 0;
const items_repo_1 = require("./items.repo");
exports.itemsService = {
    create: (body) => {
        return items_repo_1.itemRepository.create(body);
    },
    list() {
        return items_repo_1.itemRepository.list();
    },
    getById(id) {
        return items_repo_1.itemRepository.getById(id);
    },
    update(id, data) {
        return items_repo_1.itemRepository.update(id, data);
    },
    async sellMany(id, quantity) {
        const item = await items_repo_1.itemRepository.getById(id);
        if (!item)
            throw new Error('Item not found');
        if (!item.isActive)
            throw new Error('Item is not active');
        if (item.quantity < quantity)
            throw new Error('Not enough stock available');
        return items_repo_1.itemRepository.sellMany(id, quantity);
    }
};
