"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const stripe_1 = require("../../lib/stripe");
const items_service_1 = require("../items/items.service");
exports.paymentController = {
    async createCheckoutSession(req, res) {
        try {
            const { item } = req.body;
            const session = await stripe_1.stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: item.name,
                                description: item.description,
                            },
                            unit_amount: Math.round(item.price * 100), // Convert to cents
                        },
                        quantity: item.quantity,
                    }],
                success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/cancel`,
                metadata: {
                    itemId: item.id,
                }
            });
            return res.status(200).json({ url: session.url });
        }
        catch (e) {
            res.status(500).send({ error: e.message });
        }
    },
    async handleWebhook(req, res) {
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!signature || !webhookSecret) {
            return res.status(400).send('Missing signature');
        }
        try {
            const event = stripe_1.stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                const itemId = session.metadata?.itemId;
                if (!itemId) {
                    return res.status(400).json({ error: "missing itemId in metadata" });
                }
                await items_service_1.itemsService.sellOne(itemId);
            }
            return res.json({ received: true });
        }
        catch (e) {
            return res.status(400).send(`Webhook Error: ${e.message}`);
        }
    },
};
