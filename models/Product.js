import mongoose, { model, Schema, models } from "mongoose";

const ProductSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    discountedPrice: { type: Number, default: 0 }, // Add the 'discountedPrice' field here with a default value of 0
    images: [{ type: String }],
    category: { type: mongoose.Types.ObjectId, ref: 'Category' },
    properties: { type: Object },
    discount: { type: Number, default: 0 },
}, {
    timestamps: true,
});

export const Product = models.Product || model('Product', ProductSchema);
