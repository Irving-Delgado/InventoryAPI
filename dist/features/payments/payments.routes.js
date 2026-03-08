"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsRouter = void 0;
const express_1 = require("express");
const payments_controller_1 = require("./payments.controller");
exports.paymentsRouter = (0, express_1.Router)();
exports.paymentsRouter.post("/create-checkout-session", payments_controller_1.paymentController.createCheckoutSession);
