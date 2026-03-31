import request from "supertest";
import { createApp } from "../app";
import jwt from "jsonwebtoken";

jest.mock("../lib/prisma", () => ({
    prisma: {
        order: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        $disconnect: jest.fn(),
    },
}));

import { prisma } from "../lib/prisma";

const app = createApp();

const TEST_SECRET = process.env.JWT_SECRET || "test-secret";
const userToken = jwt.sign({ sub: "user-1", role: "USER" }, TEST_SECRET);
const otherUserToken = jwt.sign({ sub: "user-2", role: "USER" }, TEST_SECRET);

const mockOrderItems = [
    { itemId: "item-1", itemName: "Widget", unitPrice: 9.99, quantity: 2 },
];

const mockOrder = {
    id: "order-1",
    userId: "user-1",
    stripeSessionId: "cs_test_session",
    total: 19.98,
    status: "PENDING",
    items: mockOrderItems,
    createdAt: new Date(),
    updatedAt: new Date(),
};

afterAll(async () => {
    await prisma.$disconnect();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("POST /orders", () => {
    it("returns 401 when not authenticated", async () => {
        const res = await request(app).post("/orders").send({
            stripeSessionId: "cs_test_session",
            items: mockOrderItems,
            total: 19.98,
        });

        expect(res.status).toBe(401);
    });

    it("returns 201 when authenticated user creates an order", async () => {
        (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

        const res = await request(app)
            .post("/orders")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                stripeSessionId: "cs_test_session",
                items: mockOrderItems,
                total: 19.98,
            });

        expect(res.status).toBe(201);
        expect(res.body.id).toBe("order-1");
        expect(res.body.userId).toBe("user-1");
    });
});

describe("GET /orders", () => {
    it("returns 401 when not authenticated", async () => {
        const res = await request(app).get("/orders");

        expect(res.status).toBe(401);
    });

    it("returns 200 with the user's orders when authenticated", async () => {
        (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

        const res = await request(app)
            .get("/orders")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].id).toBe("order-1");
    });

    it("only fetches orders for the authenticated user", async () => {
        (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

        await request(app)
            .get("/orders")
            .set("Authorization", `Bearer ${otherUserToken}`);

        expect(prisma.order.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: "user-2" },
            })
        );
    });
});

describe("GET /orders/:id", () => {
    it("returns 401 when not authenticated", async () => {
        const res = await request(app).get("/orders/order-1");

        expect(res.status).toBe(401);
    });

    it("returns 200 with the order when found", async () => {
        (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

        const res = await request(app)
            .get("/orders/order-1")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe("order-1");
        expect(res.body.items).toHaveLength(1);
    });

    it("returns 404 when order does not exist", async () => {
        (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

        const res = await request(app)
            .get("/orders/nonexistent")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(404);
    });
});
