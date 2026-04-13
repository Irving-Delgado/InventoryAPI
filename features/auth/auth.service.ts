import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authRepository as authRepo } from "./auth.repo";
import { RegisterInput, LoginInput, AuthResponse } from "./auth.model";
import { JWT_SECRET } from "../../common/env";

function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
function signAccessToken(user: { id: string; role: "ADMIN" | "USER" }) {
    return jwt.sign(
        { sub: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
}
function signRefreshToken() {
    const rawRefreshToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    return { rawRefreshToken, tokenHash };
}
async function refresh(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const stored = await authRepo.findRefreshToken(tokenHash);
    if (!stored) {
        throw new Error("Invalid refresh token");
    }
    await authRepo.deleteRefreshToken(tokenHash);
    const newRefreshToken = signRefreshToken();
    await authRepo.createRefreshToken( stored.userId, newRefreshToken.tokenHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    const user = await authRepo.findUserById(stored.userId);
    if (!user) throw new Error("User not found");
    const accessToken = signAccessToken(user);
    return { accessToken, rawRefreshToken: newRefreshToken.rawRefreshToken };

}
export async function logout(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    await authRepo.deleteRefreshToken(tokenHash);
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

    const token = signAccessToken(user);

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

    const token = signAccessToken(user);

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