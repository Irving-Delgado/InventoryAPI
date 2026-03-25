import { CreateItemBody } from "./items.model";
import { itemRepository } from "./items.repo";

export const itemsService = {
    create:(body: CreateItemBody) => {
        return itemRepository.create(body);
    },
    list(page: number, limit: number, filters: { name?: string; isActive?: boolean }) {
        return itemRepository.list(page, limit, filters);
    },
    getById(id: string) {
        return itemRepository.getById(id);
    },
    update(id: string, data: Partial<CreateItemBody>) {
        return itemRepository.update(id, data);
    },
    async sellMany(id: string, quantity: number) {
        const result = await itemRepository.sellMany(id, quantity);
        if(result.count === 0){
            throw new Error("Not Enough stock or item not found");
        }
        return result;
    },
    delete(id: string){
        return itemRepository.delete(id);
    }
}