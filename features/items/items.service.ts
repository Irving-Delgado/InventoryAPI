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
    }
    
}