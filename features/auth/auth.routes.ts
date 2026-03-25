import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../common/middleware/authenticate";
import { requireRole } from "../../common/middleware/requiredRole";
import rateLimit from "express-rate-limit";

export const authRouter = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,                   
    message: { error: "Too many login attempts, try again later" }
})

authRouter.post("/register", authController.register);
authRouter.post("/login", loginLimiter, authController.login);
authRouter.get("/users", authenticate, requireRole("ADMIN"), authController.getUsers);