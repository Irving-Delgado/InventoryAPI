"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid authorization header" });
    }
    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({ error: "JWT_SECRET is not set" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
