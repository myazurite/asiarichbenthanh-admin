import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
    await mongooseConnect();

    if (req.method === 'GET') {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('line_items.product');
        res.json(orders);
    } else if (req.method === 'PUT') {
        const { orderId, paid } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            res.status(404).json({ message: 'Order not found.' });
            return;
        }

        order.paid = paid;
        await order.save();

        res.json({ message: 'Order updated.' });
    } else {
        res.status(405).json({ message: 'Method not allowed.' });
    }
}
