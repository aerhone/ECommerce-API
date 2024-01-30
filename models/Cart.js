const mongoose = require("mongoose");
const Product = require("./Product");

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, "Product ID is required"]
    },

    name: {
        type: String
    },

    quantity: {
        type: Number,
        default: 1
    },

    subtotal: {
        type: Number,
        default: 0
    }
});

const cartSchema = new mongoose.Schema({

    userId:  {
        type: String,
        required: [true, "User Id is required"]
    },

    userName: {
        type: String,
        required: [true, "username is required"]
    },

    cartItems:[cartItemSchema],

    totalPrice: {
		type: Number,
	
	},
  

    orderedOn: {
        type: Date,
        default: Date.now
    },

})

module.exports = mongoose.model("Cart", cartSchema)