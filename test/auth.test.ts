import request from "supertest";
import { createApp } from "../app";

// Mock prisma before anything imports it
jest.mock("../lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
        },
        $disconnect: jest.fn(),
    },
}));

import { prisma } from "../lib/prisma";

const app = createApp();

afterAll(async () => {
    await prisma.$disconnect();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("POST /auth/register", () => {
    it("returns 201 with a token", async () => {
        // No existing user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        // Simulate user creation
        (prisma.user.create as jest.Mock).mockResolvedValue({
            id: "test-id",
            name: "Jesse",
            email: "test@example.com",
            role: "USER",
            passwordHash: "hashed",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const res = await request(app).post("/auth/register").send({
            name: "Jesse",
            email: "test@example.com",
            password: "password123",
        });

        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe("test@example.com");
    });

    it("returns 400 with invalid email", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "Jesse",
            email: "notanemail",
            password: "password123",
        });
        expect(res.status).toBe(400);
    });

    it("returns 400 with short password", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "Jesse",
            email: "test@example.com",
            password: "123",
        });
        expect(res.status).toBe(400);
    });
});

describe("POST /auth/login", () => {
    it("returns 400 with invalid email", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "notanemail",
            password: "password123",
        });
        expect(res.status).toBe(400);
    });
});
