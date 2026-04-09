import request from "supertest";
import { createApp } from "../app";
import jwt from "jsonwebtoken";

jest.mock("bcryptjs", () => ({
    hash: jest.fn().mockResolvedValue("$2a$10$mockedhash"),
    compare: jest.fn(),
}));

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
import bcrypt from "bcryptjs";

const app = createApp();

const TEST_SECRET = process.env.JWT_SECRET || "test-secret";
const adminToken = jwt.sign({ sub: "admin-id", role: "ADMIN" }, TEST_SECRET);
const userToken = jwt.sign({ sub: "user-id", role: "USER" }, TEST_SECRET);

const mockUser = {
    id: "test-id",
    name: "Jesse",
    email: "test@example.com",
    role: "USER" as const,
    passwordHash: "$2a$10$mockedhash",
    createdAt: new Date(),
    updatedAt: new Date(),
};

afterAll(async () => {
    await prisma.$disconnect();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("POST /auth/register", () => {
    it("returns 201 with a token", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

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

    it("returns 500 when email is already in use", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        const res = await request(app).post("/auth/register").send({
            name: "Jesse",
            email: "test@example.com",
            password: "password123",
        });

        expect(res.status).toBe(500);
    });
});

describe("POST /auth/login", () => {
    it("returns 200 with a token on success", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const res = await request(app).post("/auth/login").send({
            email: "test@example.com",
            password: "password123",
        });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe("test@example.com");
    });

    it("returns 500 when user does not exist", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const res = await request(app).post("/auth/login").send({
            email: "notfound@example.com",
            password: "password123",
        });

        expect(res.status).toBe(500);
    });

    it("returns 500 when password is wrong", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const res = await request(app).post("/auth/login").send({
            email: "test@example.com",
            password: "wrongpassword",
        });

        expect(res.status).toBe(500);
    });

    it("returns 400 with invalid email", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "notanemail",
            password: "password123",
        });
        expect(res.status).toBe(400);
    });
});

describe("GET /auth/users", () => {
    it("returns 401 when not authenticated", async () => {
        const res = await request(app).get("/auth/users");
        expect(res.status).toBe(401);
    });

    it("returns 403 when user is not ADMIN", async () => {
        const res = await request(app)
            .get("/auth/users")
            .set("Authorization", `Bearer ${userToken}`);
        expect(res.status).toBe(403);
    });

    it("returns 200 with user list when ADMIN", async () => {
        (prisma.user.findMany as jest.Mock).mockResolvedValue([
            { id: "test-id", name: "Jesse", email: "test@example.com", role: "USER", createdAt: new Date(), updatedAt: new Date() },
        ]);

        const res = await request(app)
            .get("/auth/users")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].email).toBe("test@example.com");
    });
});
