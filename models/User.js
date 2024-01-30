const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    firstName:  {
        type: String,
        required: [true, "First Name is required"]
    },

    lastName:  {
        type: String,
        required: [true, "Last Name is required"]
    },

    email:  {
        type: String,
        required: [true, "Email is required"]
    },

    userName: {
        type: String,
        required: [true, "Username is required"]
    },

    password:  {
        type: String,
        required: [true, "password is required"]
    },

    isAdmin:  {
        type: Boolean,
        default: false
    },

    mobileNo: {
        type: String,
        required: [true, "Mobile Number is required"]
    },

    availableBalance: {
        type: Number,
        default: 0
    }


})


module.exports = mongoose.model("User", userSchema)