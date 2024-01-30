const mongoose = require("mongoose");
const User = require("./User");


const productSchema = new mongoose.Schema({

    name:  {
        type: String,
        required: [true, "Name is required"]
    },

    description:  {
        type: String,
        required: [true, "Description is required"]
    },

    price:  {
        type: Number,
        required: [true, "Price is required"]
    },

    inventory: {
        type: Number,
        default: 0
    },

    isActive:  {
        type: Boolean,
        default: true
    },

    createdOn: {
        type: Date,
        default: Date.now
    },

    category: {
        type: String,
        required: [true, "category is required"]
    },

    reviews: [
        {
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
            },
            star: {
                type: Number,
                default: 5
            },
            comment: {
                type: String
            }
        } 
    ]


})


module.exports = mongoose.model("Product", productSchema)