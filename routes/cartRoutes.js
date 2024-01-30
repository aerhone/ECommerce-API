// Dependencies
const express = require("express");
const cartController = require("../controllers/cartController");
const {verify, verifyAdmin} = require("../auth")

const router = express.Router();

// Retrieve user's cart
router.get("/get-cart", verify, cartController.getCart);

// Add to cart
router.put("/add-to-cart", verify, cartController.addToCart);

//Change product quantity
router.put("/update-cart-quantity", verify, cartController.updateQuantity)

// Remove product from cart
router.put("/:id/remove-from-cart", verify, cartController.removeItem)

// Clear cart
router.patch("/clear-cart", verify, cartController.clearCart)

// Export Route System 
module.exports = router;