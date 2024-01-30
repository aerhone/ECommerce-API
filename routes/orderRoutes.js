// Dependencies
const express = require("express");
const orderController = require("../controllers/orderController");
const {verify, verifyAdmin} = require("../auth")

const router = express.Router();

// create order or check out
router.post("/checkout", verify, orderController.checkout);


// Retrieve logged in user's orders
router.get("/my-orders", verify, orderController.myOrder);

// Retrieve all user's order
router.get("/all-orders", verify, verifyAdmin, orderController.allOrders);

// pay single order
router.post("/payment", verify, orderController.payment);

// pay all unpaid order
router.post("/pay-all-orders", verify, orderController.payAllPending)

// get the total sale by admin 
router.get("/totalSales", verify, verifyAdmin, orderController.totalSales)

// get total sales of a product
router.get("/productSales", verify, verifyAdmin, orderController.productSales )

// Export Route System 
module.exports = router;