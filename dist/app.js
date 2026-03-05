"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const items_routes_1 = require("./features/items/items.routes");
const express_1 = __importDefault(require("express"));
const payments_routes_1 = require("./features/payments/payments.routes");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/health', (req, res) => {
        res.json({ status: 'ok' });
    });
    app.use("/items", items_routes_1.itemsRouter);
    app.use("/payments", payments_routes_1.paymentsRouter);
    app.get("/success", (req, res) => {
        res.json({
            message: "payment success redirect hit",
            query: req.query,
        });
    });
    app.get("/cancel", (_req, res) => {
        res.json({
            message: "payment cancelled",
        });
    });
    return app;
};
exports.createApp = createApp;
