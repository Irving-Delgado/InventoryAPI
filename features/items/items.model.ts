export type InventoryItem = {
    id: number;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    isActive: boolean
    sold: number;
    /*
        sku: string;
        notes: string;
        tags: string[];
    */
    createAt: Date;
    updateAt: Date;
}

export type CreateItemBody = {
    name: string;
    description?: string;
    price?: number;
    quantity?: number;
    isActive?: boolean;

    /*
        sku?: string;
        notes?: string;
        tags?: string[];
    */
}