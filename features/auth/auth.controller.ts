import { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        next(error);
    }
}
export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    } catch (error: any) {
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