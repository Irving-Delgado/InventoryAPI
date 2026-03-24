import { CreateShippingBody } from './shipping.model';
import { ShippingRepository } from './shipping.repo';

export const ShippingService = {
    create: (userId: string, body: CreateShippingBody) => {
        return ShippingRepository.create(userId, body);
    },
    list: (userId: string) => {
        return ShippingRepository.list(userId);
    },
    getById: (id: string) => {
        return ShippingRepository.getById(id);
    },
    update: (id: string, data: CreateShippingBody) => {
        return ShippingRepository.update(id, data);
    },
    delete: (id: string) => {
        return ShippingRepository.delete(id);
    }
}