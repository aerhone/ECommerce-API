// Dependencies
const express = require("express");
const userController = require("../controllers/userController");
const {verify, verifyAdmin} = require("../auth")

const router = express.Router();

// Route for user registration
router.post("/", userController.registerUser);

// Route for user authentication
router.post("/login", userController.loginUser);

// Route for getting user details
router.get("/details", verify, userController.getUserDetails);

// Route for updating user as admin
router.put("/:id/set-as-admin", verify, verifyAdmin, userController.updateAdmin)

// Route for updating password
router.put("/update-password", verify, userController.updatePassword);

// Route for viewing User's Available Balance
router.get("/viewBalance", verify, userController.viewBalance);

// Route for topping up User's Balance
router.patch("/topUp", verify, userController.topUp);

// Export Route System 
module.exports = router;

