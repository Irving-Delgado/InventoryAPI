import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../common/middleware/authenticate";
import { requireRole } from "../../common/middleware/requiredRole";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/users", authenticate, requireRole("ADMIN"), authController.getUsers);