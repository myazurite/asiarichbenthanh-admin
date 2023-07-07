import {model, models, Schema} from "mongoose";

const LineItemSchema = new Schema({
    product: {type:Schema.Types.ObjectId, ref:'Product'},
    name: String,
    quantity: Number,
    price_data: {
        unit_amount: Number,
    },
});

const OrderSchema = new Schema({
    line_items: [LineItemSchema],
    name: String,
    address: String,
    phone: String,
    total_price: Number,
    paid: Boolean,
}, {
    timestamps: true,
});

export const Order = models?.Order || model('Order', OrderSchema);
