const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productID: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  productCategory: {
    type: String,
    required: true,
  },
  image: {
    data: String,
    contentType: String,
  },
  productTags: [String],
  introducedDate: {
    type: Date,
    default: Date.now(),
  },
  adder: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
