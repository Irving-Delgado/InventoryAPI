import {Request, Response} from "express";
import {stripe} from "../../lib/stripe"; 
import { itemsService } from "../items/items.service";
import { orderService } from "../orders/order.service";

export const paymentController = {
    async createCheckoutSession(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const { itemId, purchaseQuantity } = req.body;

            if (!itemId || !purchaseQuantity || purchaseQuantity <= 0) {
                return res.status(400).json({
                    error: "itemId and valid purchaseQuantity are required",
                });
            }

            const item = await itemsService.getById(itemId);

            if (!item) {
                return res.status(404).json({ error: "Item not found" });
            }

            if (!item.isActive) {
                return res.status(400).json({ error: "Item is not active" });
            }

            if (purchaseQuantity > item.quantity) {
                return res.status(400).json({ error: "Not enough stock available" });
            }

            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: item.name,
                            description: item.description ?? undefined,
                        },
                        unit_amount: Math.round(item.price * 100), // Convert to cents
                    },
                    quantity: purchaseQuantity,
                }],
                success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/cancel`,
                metadata: {
                    userId: req.user?.id,
                    itemId: item.id,
                    itemName: item.name,
                    itemPrice: item.price,
                    purchaseQuantity: purchaseQuantity.toString(),
                }
            })
            return res.status(200).json({ url: session.url });
        } catch (e: any) {
            res.status(500).send({ error: e.message });
        }
    },
    async handleWebhook(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
        if(!signature || !webhookSecret) {
            return res.status(400).send('Missing signature');
        }
        try {
            const event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                webhookSecret
            );
            switch (event.type) {

                    case "checkout.session.completed" :
                        const session = event.data.object;
                        
                        const { itemId, userId, itemName, itemPrice, purchaseQuantity: rawQuantity } = session.metadata ?? {};
                        const quantity = Number(rawQuantity ?? 1);
                        const unitPrice = Number(itemPrice);


                    if (!itemId || !userId || !itemName || !quantity ||!unitPrice) {
                        return res.status(400).json({ error: "Missing required metadata" });
                    }
                    

                    await itemsService.sellMany(itemId, quantity);
                    const order = await orderService.create({
                        userId: userId,
                        stripeSessionId: session.id,
                        items: [{
                            itemId: itemId,
                            itemName: itemName,
                            quantity: quantity,
                            unitPrice: unitPrice,
                        }],
                        total: quantity*unitPrice
                    })
                    await orderService.updateStatus(order.id, "PAID");
                    break;
                case "checkout.session.async_payment_failed":
                    console.error("Payment Failed", event.data.object.id)
                    break;
            }

            return res.json({ received: true });
        }catch (e: any) {
            return res.status(400).send(`Webhook Error: ${e.message}`);
        }
    }
}