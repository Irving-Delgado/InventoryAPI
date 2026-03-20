export type OrderItem = {
    itemId: string;
    itemName: string;
    unitPrice: number;
    quantity: number;
}

export type CreateOrderBody = {
    userId: string;
    stripeSessionId: string;
    items: OrderItem[];
    total: number;
}

export type Order = {
    id: string;
    itemId: string;
    items: OrderItem[];
    total: number;
    status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
    createdAt: Date;
    updatedAt: Date;
}