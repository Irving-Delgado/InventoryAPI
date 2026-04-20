import request from "supertest";
import { createApp } from "../app";
import jwt from "jsonwebtoken";

jest.mock("../lib/prisma", () => ({
    prisma: {
        item: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $disconnect: jest.fn(),
    },
}));

import { prisma } from "../lib/prisma";

const app = createApp();

const TEST_SECRET = process.env.JWT_SECRET || "test-secret";
const adminToken = jwt.sign({ sub: "admin-id", role: "ADMIN" }, TEST_SECRET);
const userToken = jwt.sign({ sub: "user-id", role: "USER" }, TEST_SECRET);

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

describe("GET /items", () => {
    it("returns 200 with a list of items (public)", async () => {
        (prisma.item.findMany as jest.Mock).mockResolvedValue([mockItem]);

        const res = await request(app).get("/v1/items");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].name).toBe("Widget");
    });

    it("supports pagination via query params", async () => {
        (prisma.item.findMany as jest.Mock).mockResolvedValue([mockItem]);

        const res = await request(app).get("/v1/items?page=2&limit=5");

        expect(res.status).toBe(200);
        expect(prisma.item.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 5, skip: 5 })
        );
    });

    it("filters by name when provided", async () => {
        (prisma.item.findMany as jest.Mock).mockResolvedValue([mockItem]);

        const res = await request(app).get("/v1/items?name=Widget");

        expect(res.status).toBe(200);
        expect(prisma.item.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    name: expect.objectContaining({ contains: "Widget" }),
                }),
            })
        );
    });

    it("filters by isActive=false when provided", async () => {
        (prisma.item.findMany as jest.Mock).mockResolvedValue([]);

        const res = await request(app).get("/v1/items?isActive=false");

        expect(res.status).toBe(200);
        expect(prisma.item.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ isActive: false }),
            })
        );
    });
});

describe("GET /items/:id", () => {
    it("returns 200 with the item (public)", async () => {
        (prisma.item.findUnique as jest.Mock).mockResolvedValue(mockItem);

        const res = await request(app).get("/v1/items/item-1");

        expect(res.status).toBe(200);
        expect(res.body.id).toBe("item-1");
    });

    it("returns 404 when item does not exist", async () => {
        (prisma.item.findUnique as jest.Mock).mockResolvedValue(null);

        const res = await request(app).get("/v1/items/nonexistent");

        expect(res.status).toBe(404);
    });
});

describe("POST /items", () => {
    it("returns 401 when no token provided", async () => {
        const res = await request(app).post("/v1/items").send({
            name: "New Item",
            price: 5.0,
            quantity: 10,
        });

        expect(res.status).toBe(401);
    });

    it("returns 403 when user is not ADMIN", async () => {
        const res = await request(app)
            .post("/v1/items")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                name: "New Item",
                price: 5.0,
                quantity: 10,
            });

        expect(res.status).toBe(403);
    });

    it("returns 201 when ADMIN creates an item", async () => {
        (prisma.item.create as jest.Mock).mockResolvedValue(mockItem);

        const res = await request(app)
            .post("/v1/items")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Widget",
                price: 9.99,
                quantity: 100,
            });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe("Widget");
    });

    it("returns 400 when body is invalid (negative price)", async () => {
        const res = await request(app)
            .post("/v1/items")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Bad Item",
                price: -1,
                quantity: 10,
            });

        expect(res.status).toBe(400);
    });

    it("returns 400 when name is missing", async () => {
        const res = await request(app)
            .post("/v1/items")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                price: 5.0,
                quantity: 10,
            });

        expect(res.status).toBe(400);
    });
});

describe("PUT /items/:id", () => {
    it("returns 401 when no token provided", async () => {
        const res = await request(app).put("/v1/items/item-1").send({ price: 12.99 });

        expect(res.status).toBe(401);
    });

    it("returns 403 when user is not ADMIN", async () => {
        const res = await request(app)
            .put("/v1/items/item-1")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ price: 12.99 });

        expect(res.status).toBe(403);
    });

    it("returns 200 when ADMIN updates an item", async () => {
        const updated = { ...mockItem, price: 12.99 };
        (prisma.item.update as jest.Mock).mockResolvedValue(updated);

        const res = await request(app)
            .put("/v1/items/item-1")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ price: 12.99 });

        expect(res.status).toBe(200);
        expect(res.body.price).toBe(12.99);
    });

    it("returns 400 when body has invalid price", async () => {
        const res = await request(app)
            .put("/v1/items/item-1")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ price: -5 });

        expect(res.status).toBe(400);
    });

    it("returns 500 when item does not exist", async () => {
        (prisma.item.update as jest.Mock).mockRejectedValue(new Error("Record not found"));

        const res = await request(app)
            .put("/v1/items/nonexistent")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ price: 9.99 });

        expect(res.status).toBe(500);
    });
});

describe("DELETE /items/:id", () => {
    it("returns 401 when no token provided", async () => {
        const res = await request(app).delete("/v1/items/item-1");

        expect(res.status).toBe(401);
    });

    it("returns 403 when user is not ADMIN", async () => {
        const res = await request(app)
            .delete("/v1/items/item-1")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

    it("returns 204 when ADMIN deletes an item", async () => {
        (prisma.item.delete as jest.Mock).mockResolvedValue(mockItem);

        const res = await request(app)
            .delete("/v1/items/item-1")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(204);
    });

    it("returns 500 when item does not exist", async () => {
        (prisma.item.delete as jest.Mock).mockRejectedValue(new Error("Record not found"));

        const res = await request(app)
            .delete("/v1/items/nonexistent")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
    });
});
