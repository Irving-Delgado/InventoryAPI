import { CreateItemBody } from "./items.model";
import { itemRepository } from "./items.repo";

export const itemsService = {
    create:(body: CreateItemBody) => {
        return itemRepository.create(body);
    },
    list() {
        return itemRepository.list();
    },
    getById(id: string) {
        return itemRepository.getById(id);
    },
    update(id: string, data: Partial<CreateItemBody>) {
        return itemRepository.update(id, data);
    },
    async sellOne(id: string) {
        const item = await itemRepository.getById(id);
        if(!item) throw new Error('Item not found');
        if(!item.isActive) throw new Error('Item is not active');
        if(item.quantity <= 0) throw new Error('Item is out of stock');
        
        return itemRepository.sellOne(id);
    }
}