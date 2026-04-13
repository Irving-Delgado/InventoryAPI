import { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service";
import { loginSchema, registerSchema } from "./auth.model";

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const input = registerSchema.parse(req.body);
        const result = await authService.register(input);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const input = loginSchema.parse(req.body);
        const result = await authService.login(input);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await authService.getUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}
export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const rawToken = req.cookies.refreshToken;
        if (!rawToken) {
            return res.status(204).send();
        }
        await authService.logout(rawToken);
        res.clearCookie("refreshToken");
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}