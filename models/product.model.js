import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },

  description: { type: String, required: true },

  images: [{ type: String, required: true }],

  price: { type: Number, required: true },

  stock: { type: Number, default: 0 },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true,
  },

  offers: { type: Number, default: 0 }, // percent discount

  ratings: { type: Number, default: 0 },

  totalReviews: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.model("Product", productSchema);
