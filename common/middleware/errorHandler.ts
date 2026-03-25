import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(req: Request, res: Response, next: NextFunction) {
    return (err: unknown, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ZodError) {
            return res.status(400).json({ error: err.issues });
        }
        return res.status(500).json({ error: "Internal server error" });
    };
}