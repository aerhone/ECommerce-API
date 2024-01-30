// Dependencies
const Cart = require("../models/Cart");
const Product = require("../models/Product")
const mongoose = require("mongoose");
const isValidObjectId = mongoose.Types.ObjectId.isValid; //Checker if Valid ID


// retrieve user's cart
module.exports.getCart = (req, res) => {
    try{
        return Cart.findOne({userId: req.user.id})
        .select({
            cartItems: {
              _id: 0,
              productId: 0
            },
            _id: 0, userId: 0, __v: 0
          })
          .select({ totalPrice: 1 })
          .lean()
        .then(result => {
            if(result){
                if (result.cartItems.length <= 0){
                    return res.status(200).json({message: "Your cart is empty"})
                }
                return res.status(200).json(result)
            }
        })
    }catch(err){
        res.status(500).send("Internal Server error")
    }
}

// add to cart
module.exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        
        // Validate if req.body.id is a valid ObjectId
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }     

        if(product.inventory < quantity){ //check if the quantity is more than inventory
            return res.status(400).send({error: "Insufficient stock"})
        }

        if (!product) { // Check if the product  does not exists
            return res.status(404).send({ error: 'Product not found' });
        }
        else if (!product.isActive){ // Checks if the product is active/with stock
            return res.status(400).send({error: "product is out of stock"})
        }

         // Validate if quantity is a valid number
         if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }
        
        let cart = await Cart.findOne({ userId: req.user.id });

        // Check if the product is already in the cart
        const existingCartItem = cart.cartItems.find(item => item.productId.equals(productId));

        if (existingCartItem) {
            // If the product is already in the cart, update the quantity
            existingCartItem.quantity += quantity;
            // then calculate the new subtotal
            const newSubtotal = quantity * product.price;
            existingCartItem.subtotal += newSubtotal
            
        } else {
            // If the product is not in the cart, add a new item
            const subtotal = quantity * product.price;
            const name = product.name
        
            cart.cartItems.push({ productId, name, quantity, subtotal });
            console.log(cart.cartItems)
        }

        // Recalculate the total price
        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);
        console.log(cart)
        // Save the cart
        await cart.save();

        return res.status(200).json({ message: 'Item added to cart successfully', cartItems: cart.cartItems, total: cart.totalPrice });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    
}

// Update Cart Quantity
module.exports.updateQuantity = async (req, res) => {    
    try {
        const { productId, quantity } = req.body;
        
        // Validate if req.body.id is a valid ObjectId
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }       
        
        // Validate if quantity is a valid number
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        const cart = await Cart.findOne({ userId: req.user.id });
    
        const updatedCartItem = cart.cartItems.find(item => item.productId.equals(productId))
        
    
        if (!updatedCartItem) {
            return res.status(404).json({ error: 'Item not in cart' });
        }
        
        let product;
        try {
            product = await Product.findById(productId);
        } catch (productError) {
            console.error(productError);
            return res.status(500).json({ error: 'Error fetching product details' });
        }

        if (quantity > product.inventory){
            return res.status(400).send({error: "Insufficient inventory"})
        }

        const updatedCart = await Cart.findOneAndUpdate(
            { 'userId': req.user.id, 'cartItems.productId': productId },
            {
                $set: {
                    'cartItems.$.quantity': quantity,
                    'cartItems.$.subtotal': quantity * product.price,

                }
            },
            { new: true }
        ).select({
            cartItems: {
              _id: 0,
              productId: 0
            },
            _id: 0, userId: 0, __v: 0
        })
        .select({ totalPrice: 1 })
        .lean();;

        const totalPrice = await Cart.findOneAndUpdate(
            { 'userId': req.user.id},
            {
                $set: {

                    'totalPrice': updatedCart.cartItems.reduce((total, item) => total + item.subtotal, 0)
                }
            },
            { new: true }
        )
        .select({
            cartItems: {
              _id: 0,
              productId: 0
            },
            _id: 0, userId: 0, __v: 0
        })
        .select({ totalPrice: 1 })
        .lean();
        
    
        res.status(200).json({ message: 'Quantity updated successfully', totalPrice });
    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

//Remove item from Cart
module.exports.removeItem = async (req, res) => {
    try {
        // Validate if req.params.id is a valid ObjectId
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
    
        const cart = await Cart.findOne({userId: req.user.id});
        
        let removedCartItem = cart.cartItems.find(item => item.productId === req.params.id)
  
        if (removedCartItem) {
            return res.status(404).send({message: 'Item not in cart'});
        }
            
        if (cart.cartItems.length <= 0) {
            return res.status(404).send ({ message: 'Cart is empty'});
        }

        const updatedCart = await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { $pull: { cartItems: { productId: req.params.id } } },
            { new: true }
        );
            
        updatedCart.totalPrice = updatedCart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        // Save the updated cart
        await updatedCart.save();

        return res.status(200).send ({ message: 'Item removes successfully', cart: updatedCart});

    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

// Clear cart
module.exports.clearCart = async (req, res) => {
    try{
        const cart = await Cart.findOne({userId: req.user.id})
        if (cart.cartItems.length === 0) {
            return res.status(404).json({ message: "Cart is already empty" });
        }
        
        const updatedCart = await Cart.findOneAndUpdate(
            {userId: req.user.id},
            {
                $set: {
                    'cartItems': [],
                    'totalPrice': 0
                }
            },
            { new: true }
        );

        return res.status(200).send({message: "Cart is empty"})

    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

