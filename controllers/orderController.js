// Dependencies
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product")
const User = require("../models/User")

const mongoose = require("mongoose");
const isValidObjectId = mongoose.Types.ObjectId.isValid; //Checker if Valid ID

// Checkout orders on cart
module.exports.checkout = async (req, res) => {
    try {
        const userCart = await Cart.findOne({ userId: req.user.id });
    
        if (userCart.cartItems.length <= 0) {
            return res.status(404).json({ message: "Unable to checkout. Cart is empty" });
        }

        for (const item of userCart.cartItems) {
            const product = await Product.findById(item.productId);
    
            if (item.quantity > product.inventory) {
                // Handle the case where there is insufficient stock
                return res.status(400).json({ error: `Check out error. ${product.name} has insufficient stock. Please change the quantity` });
            }
        }
    
        // Create a new order
        const newOrder = new Order({
            userId: userCart.userId,
            userName: userCart.userName,
            productsOrdered: userCart.cartItems,
            totalPrice: userCart.totalPrice
        });
    
        // Save the order
        const savedOrder = await newOrder.save();
    
        // Update product inventories
        for (const item of userCart.cartItems) {
            const product = await Product.findById(item.productId);

            // Update the product inventory
            product.inventory -= item.quantity;
            if(product.inventory <= 0){
                product.isActive = false
                await product.save();
            }
            await product.save();
        
        }
    
        // Empty the user's cart
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: req.user.id },
            {
                $set: {
                    'cartItems': [],
                    'totalPrice': 0
                }
            },
            { new: true }
        );
    
        return res.status(201).json({ message: "Check-out successful", productsOrdered: savedOrder.productsOrdered, totalPrice: savedOrder.totalPrice });
    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

// Retrieved logged in user order
module.exports.myOrder = async (req, res) => {
    try{
        let userOrders = await Order.find({userId: req.user.id}
            ,{_id: 0, userId: 0, __v: 0, 'productsOrdered.productId': 0, 'productsOrdered._id': 0});
        if(userOrders.length <= 0){
            return res.status(404).json({message: "Your have no pending order"})
        }

        return res.status(201).json({Orders: userOrders})
    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

// Retrieve all user's order by admin
module.exports.allOrders = async (req, res) => {
    try{
        let allOrders = await Order.find({},
            {_id: 0, userId: 0, __v: 0, 'productsOrdered.productId': 0, 'productsOrdered._id': 0});
        if(allOrders.length <= 0){
            return res.status(404).json({message: "No orders"})
        }

        return res.status(201).json({Orders: allOrders})

    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

// payment. Note: only simulation no gateway
module.exports.payment = async (req, res) => {
    try{
        const wallet = await User.findById(req.user.id);

        let {orderId} = req.body

        let orderPayment = await Order.findById(orderId);
        console.log(orderPayment)
        if (orderPayment.status === "Paid"){
            return res.status(400).json({Error: "product already paid"})
        }
        if (orderPayment.totalPrice > wallet.availableBalance){
            return res.status(400).json({Error: "Insufficient Balance in wallet. Please Top-up."})
        }

        wallet.availableBalance -= orderPayment.totalPrice
        orderPayment.status = "Paid"
        await wallet.save()
        await orderPayment.save()

        return res.status(201).json ({message: `You paid a total of ${orderPayment.totalPrice}. Your new wallet balance is ${wallet.availableBalance}` })

    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

// Pay all pending
module.exports.payAllPending = async (req, res) => {
    try{
        const wallet = await User.findById(req.user.id);
        let payment = wallet.availableBalance;

        let pendingOrders = await Order.find({ $and: [ {userId :  req.user.id }, {status : "Pending" }] })

        if(pendingOrders.length <= 0){
            res.status(400).json({Error: "No orders pending for payment"})
        }

        let amountToPay = 0

        for(let i=0; i < pendingOrders.length; i++){
            let subtotal = pendingOrders[i].totalPrice
            amountToPay += subtotal
        }

        if(payment < amountToPay){
            return res.status(400).json({Error: "Insufficient Balance in wallet. Please Top-up."})           
        }

        await Order.updateMany(
            { userId: req.user.id, status: "Pending" },
            { $set: { status: "Paid" } }
        );
        wallet.availableBalance -= amountToPay;
        await wallet.save();
        return res.status(201).json ({message: `You paid a total of ${amountToPay}. Your new wallet balance is ${wallet.availableBalance}`})

 
    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

// Get total sale
module.exports.totalSales = async (req, res) => {
    try{
        let sales = await Order.find({status: "Paid"})

        if (sales.length <= 0){
            return res.status(404).json({message: `You have no sale`})
        }

        let total = 0

        for(let i=0; i < sales.length ; i++){
            let subtotal = sales[i].totalPrice
            total += subtotal
        }

        return res.status(200).json({message: `Congratulations! you have a grand total of sales amounting ${total}.`})

    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

module.exports.productSales = async (req, res) => {
    try{
        const product = await Order.find({
            $and: [{status: "Paid"}, {'productsOrdered.productId': req.body.id}]
        })

        const item = await Product.findById(req.body.id)
        let specificProduct = item.name

        if(product.length <= 0){
            return res.status(404).json({message: `${specificProduct} has no sale yet`})
        }

        let total = 0

    
        for (let i = 0; i < product.length; i++) {
            let orders = product[i].productsOrdered;
  
            for (let j = 0; j < orders.length; j++) {
                if (orders[j].productId.toString() === req.body.id) {
                    const subtotal = orders[j].subtotal;
                    total += subtotal;
                }
            }
        }

        return res.status(200).json({message: `${specificProduct} has a total sales of ${total}`})

    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}