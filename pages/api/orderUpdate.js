import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        res.status(400).json({ message: 'This should be a PUT request' });
        return;
    }

    const { orderId, paidStatus } = req.body;

    await mongooseConnect();

    try {
        await Order.findByIdAndUpdate(orderId, { paid: paidStatus });
        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order' });
    }
}
