import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authRepository as authRepo } from "./auth.repo";
import { RegisterInput, LoginInput, AuthResponse } from "./auth.model";
import { JWT_SECRET } from "../../common/env";

function generateTokens( userId : string) {
    const accessToken = jwt.sign(
        { sub: userId },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
    const rawRefreshToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
}

function signToken(user: { id: string; role: "ADMIN" | "USER" }) {
    return jwt.sign(
        { sub: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const password = input.password;

    if (!name) throw new Error("Name is required");
    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
    if (password.length < 8) throw new Error("Password must be at least 8 characters");

    const existingUser = await authRepo.findUserByEmail(email);
    if (existingUser) {
        throw new Error("Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await authRepo.createUser({
        name,
        email,
        passwordHash,
    });

    const token = signToken(user);

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

export async function login(input: LoginInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");

    const user = await authRepo.findUserByEmail(email);
    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    const token = signToken(user);

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

export async function getUsers() {
  return authRepo.findAllUsers();
}