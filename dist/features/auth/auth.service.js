"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getUsers = getUsers;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repo_1 = require("./auth.repo");
async function register(input) {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const password = input.password;
    if (!name)
        throw new Error("Name is required");
    if (!email)
        throw new Error("Email is required");
    if (!password)
        throw new Error("Password is required");
    const existingUser = await auth_repo_1.authRepository.findUserByEmail(email);
    if (existingUser) {
        throw new Error("Email already in use");
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await auth_repo_1.authRepository.createUser({
        name,
        email,
        passwordHash,
    });
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not set");
    }
    const token = jsonwebtoken_1.default.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: "7d" });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
}
async function login(input) {
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    if (!email)
        throw new Error("Email is required");
    if (!password)
        throw new Error("Password is required");
    const user = await auth_repo_1.authRepository.findUserByEmail(email);
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not set");
    }
    const token = jsonwebtoken_1.default.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: "7d" });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
}
async function getUsers() {
    return auth_repo_1.authRepository.findAllUsers();
}
