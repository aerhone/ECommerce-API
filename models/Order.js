const mongoose = require("mongoose");
const Product = require("./Product");
const Cart = require("./Cart")

const orderItemSchema = new mongoose.Schema({
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

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "User Id is required"]
    },

    userName: {
        type: String,
        required: [true, "username is required"]
    },

    productsOrdered: [orderItemSchema],

    totalPrice: {
		type: Number,
		Default: 0
	},
    
    orderedOn: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Pending"
    }
})

module.exports = mongoose.model("Order", orderSchema)