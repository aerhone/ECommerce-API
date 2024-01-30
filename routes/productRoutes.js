// Dependencies
const express = require("express");
const productController = require("../controllers/productController");
const {verify, verifyAdmin} = require("../auth")

const router = express.Router();

// Create Product
router.post("/", verify, verifyAdmin, productController.createProduct);

// Retrieve all products
router.get("/all", verify, verifyAdmin, productController.retrieveAllProducts);

// Retrieve all active ONLY products
router.get("/", productController.retrieveActiveProducts);

// Retrieve single product
router.get("/:id", productController.retrieveSingleProduct);

//Update product info
router.patch("/:id/update", verify, verifyAdmin, productController.updateProduct);

// Archive products
router.patch("/:id/archive", verify, verifyAdmin, productController.archiveProduct);

// Activate products
router.patch("/:id/activate", verify, verifyAdmin, productController.activateProduct);

// search by name
router.post("/searchByName", productController.searchByName);

// search by price range
router.post("/searchByPrice", productController.searchByPrice);

// search by category
router.post("/searchByCategory", productController.searchByCategory);

// update product inventory by admin
router.patch("/update-inventory", verify, verifyAdmin, productController.updateInventory)

// write a review by logged in user
router.patch("/:id/writeReview", verify, productController.writeReview);

// view all review for a product
router.get("/:id/viewReview", productController.viewReview)


// Export Route System 
module.exports = router;




