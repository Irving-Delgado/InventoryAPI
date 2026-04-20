import request from "supertest";
import { createApp } from "../app";
import jwt from "jsonwebtoken";

jest.mock("../lib/stripe", () => ({
    stripe: {
        checkout: {
            sessions: {
                create: jest.fn(),
            },
        },
        webhooks: {
            constructEvent: jest.fn(),
        },
    },
}));

jest.mock("../lib/prisma", () => ({
    prisma: {
        item: {
            findUnique: jest.fn(),
            updateMany: jest.fn(),
        },
        order: {
            create: jest.fn(),
            update: jest.fn(),
        },
        $disconnect: jest.fn(),
    },
}));

import { prisma } from "../lib/prisma";
import { stripe } from "../lib/stripe";

const app = createApp();

const TEST_SECRET = process.env.JWT_SECRET || "test-secret";
const userToken = jwt.sign({ sub: "user-1", role: "USER" }, TEST_SECRET);

const mockItem = {
    id: "item-1",
    name: "Widget",
    description: "A test widget",
    price: 9.99,
    quantity: 100,
    sold: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

afterAll(async () => {
    await prisma.$disconnect();
});

afterEach(() => {
    jest.clearAllMocks();
});

// ─── POST /payments/create-checkout-session ───────────────────────────────────

describe("POST /payments/create-checkout-session", () => {
    it("returns 401 when not authenticated", async () => {
        const res = await request(app)
            .post("/v1/payments/create-checkout-session")
            .send({ itemId: "item-1", purchaseQuantity: 1 });

        expect(res.status).toBe(401);
    });

    it("returns 400 when itemId is missing", async () => {
        const res = await request(app)
            .post("/v1/payments/create-checkout-session")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ purchaseQuantity: 1 });

        expect(res.status).toBe(400);
    });

    it("returns 400 when purchaseQuantity is 0", async () => {
        const res = await request(app)
            .post("/v1/payments/create-checkout-session")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ itemId: "item-1", purchaseQuantity: 0 });

        expect(res.status).toBe(400);
    });

    it("returns 404 when item does not exist", async () => {
        (prisma.item.findUnique as jest.Mock).mockResolvedValue(null);

        const res = await request(app)
            .post("/v1/payments/create-checkout-session")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ itemId: "nonexistent", purchaseQuantity: 1 });

        expect(res.status).toBe(404);
    });

    it("returns 400 when item is not active", async () => {
        (prisma.item.findUnique as jest.Mock).mockResolvedValue({ ...mockItem, isActive: false });

        const res = await request(app)
            .post("/v1/payments/create-checkout-session")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ itemId: "item-1", purchaseQuantity: 1 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Item is not active");
    });

    it("returns 400 when requested quantity exceeds stock", async () => {
        (prisma.item.findUnique as jest.Mock).mockResolvedValue({ ...mockItem, quantity: 2 });

        const res = await request(app)
            .post("/v1/payments/create-checkout-session")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ itemId: "item-1", purchaseQuantity: 5 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Not enough stock available");
    });

    it("returns 200 with a checkout URL on success", async () => {
        (prisma.item.findUnique as jest.Mock).mockResolvedValue(mockItem);
        (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
            url: "https://checkout.stripe.com/test-session",
        });

        const res = await request(app)
            .post("/v1/payments/create-checkout-session")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ itemId: "item-1", purchaseQuantity: 2 });

        expect(res.status).toBe(200);
        expect(res.body.url).toBe("https://checkout.stripe.com/test-session");
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: "payment",
                metadata: expect.objectContaining({
                    itemId: "item-1",
                    userId: "user-1",
                    purchaseQuantity: "2",
                }),
            })
        );
    });
});

// ─── POST /payments/webhook ───────────────────────────────────────────────────

describe("POST /payments/webhook", () => {
    const webhookBody = JSON.stringify({ type: "checkout.session.completed" });

    it("returns 400 when stripe-signature header is missing", async () => {
        const res = await request(app)
            .post("/payments/webhook")
            .set("Content-Type", "application/json")
            .send(webhookBody);

        expect(res.status).toBe(400);
    });

    it("returns 400 when constructEvent throws (invalid signature)", async () => {
        (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid signature");
        });

        const res = await request(app)
            .post("/payments/webhook")
            .set("Content-Type", "application/json")
            .set("stripe-signature", "bad-sig")
            .send(webhookBody);

        expect(res.status).toBe(400);
    });

    it("returns 200 and processes checkout.session.completed", async () => {
        const mockEvent = {
            type: "checkout.session.completed",
            data: {
                object: {
                    id: "cs_test_session",
                    metadata: {
                        userId: "user-1",
                        itemId: "item-1",
                        itemName: "Widget",
                        itemPrice: "9.99",
                        purchaseQuantity: "2",
                    },
                },
            },
        };

        (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
        (prisma.item.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

        const mockOrder = { id: "order-1", status: "PENDING" };
        (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
        (prisma.order.update as jest.Mock).mockResolvedValue({ ...mockOrder, status: "PAID" });

        const res = await request(app)
            .post("/payments/webhook")
            .set("Content-Type", "application/json")
            .set("stripe-signature", "valid-sig")
            .send(webhookBody);

        expect(res.status).toBe(200);
        expect(res.body.received).toBe(true);
        expect(prisma.item.updateMany).toHaveBeenCalled();
        expect(prisma.order.create).toHaveBeenCalled();
        expect(prisma.order.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { status: "PAID" } })
        );
    });

    it("returns 400 when metadata is missing from the session", async () => {
        const mockEvent = {
            type: "checkout.session.completed",
            data: {
                object: {
                    id: "cs_test_session",
                    metadata: {},
                },
            },
        };

        (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);

        const res = await request(app)
            .post("/payments/webhook")
            .set("Content-Type", "application/json")
            .set("stripe-signature", "valid-sig")
            .send(webhookBody);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Missing required metadata");
    });

    it("returns 200 and ignores unhandled event types", async () => {
        const mockEvent = {
            type: "payment_intent.created",
            data: { object: {} },
        };

        (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);

        const res = await request(app)
            .post("/payments/webhook")
            .set("Content-Type", "application/json")
            .set("stripe-signature", "valid-sig")
            .send(webhookBody);

        expect(res.status).toBe(200);
        expect(res.body.received).toBe(true);
    });
});
