# E-Commerce API

As part of our bootcamp, together with 1 co-bootcamper, we created a backend for an e-commerce app using RESTful API

## Please note:
- set up your own .env file - follow the .envsample for your reference

## App Features:
1. **User Registration**
   - **ROUTE:** `router.post("/", userController.registerUser)`
   - **MINIMUM REQUIREMENT:** Enable a user to register with default assignment as a regular client.
   - **ADDITIONAL FUNCTION:** Upon successful registration, a cart will automatically be assigned to a new user. One user will only have one cart.

2. **User Authentication**
   - **ROUTE:** `router.post("/login", userController.loginUser)`
   - **MINIMUM REQUIREMENT:** Users can authenticate their accounts by logging in to their registered account.
   - **ADDITIONAL FUNCTION:** Users can now use their username aside from their email for logging in.

3. **Retrieve User Details**
   - **ROUTE:** `router.get("/details", verify, userController.getUserDetails)`
   - **MINIMUM REQUIREMENT:** Only registered users can retrieve their details (note that the password will be hidden on the retrieved details).

4. **Set User as Admin**
   - **ROUTE:** `router.put("/:id/set-as-admin", verify, verifyAdmin, userController.updateAdmin)`
   - **MINIMUM REQUIREMENT:** Only an admin can update a regular user as an admin.

5. **Update Password**
   - **ROUTE:** `router.put("/update-password", verify, userController.updatePassword)`
   - **MINIMUM REQUIREMENT:** Only registered users can change their password.

6. **Create Product**
   - **ROUTE:** `router.post("/", verify, verifyAdmin, productController.createProduct)`
   - **MINIMUM REQUIREMENT:** Only admin users can create a product. The default behavior for the product created is to be an active product.
   - **ADDITIONAL FUNCTION:** Added an inventory function where it is required to add the inventory for the product. If the admin entered the inventory to be 0, the product will be tagged as an inactive (archived) product. Also added is the category for the product to be used in search by category function.

7. **Retrieve All Products**
   - **ROUTE:** `router.get("/all", verify, verifyAdmin, productController.retrieveAllProducts)`
   - **MINIMUM REQUIREMENT:** Only admin users can retrieve all products, whether it is active or not.

8. **Retrieve All Active Products**
   - **ROUTE:** `router.get("/", productController.retrieveActiveProducts)`
   - **MINIMUM REQUIREMENT:** Even non-registered users can retrieve only the products tagged as active.
   - **ADDITIONAL FUNCTION:** Optimized the search output to hide unnecessary details like product id, etc.

9. **Retrieve Single Product**
   - **ROUTE:** `router.get("/:id", productController.retrieveSingleProduct)`
   - **MINIMUM REQUIREMENT:** Even non-registered users can retrieve a product using its id as a parameter.
   - **ADDITIONAL FUNCTION:** Optimized the search output to hide unnecessary details like product id, etc.

10. **Update Product Info**
    - **ROUTE:** `router.patch("/:id/update", verify, verifyAdmin, productController.updateProduct)`
    - **MINIMUM REQUIREMENT:** Only an admin user can update the product info.

11. **Archive a Product**
    - **ROUTE:** `router.patch("/:id/archive", verify, verifyAdmin, productController.archiveProduct)`
    - **MINIMUM REQUIREMENT:** Only an admin user can set the product to inactive.

12. **Activate a Product**
    - **ROUTE:** `router.patch("/:id/activate", verify, verifyAdmin, productController.activateProduct)`
    - **MINIMUM REQUIREMENT:** Only an admin user can set the product from archived to active.

13. **Search By Name**
    - **ROUTE:** `router.post("/searchByName", productController.searchByName)`
    - **MINIMUM REQUIREMENT:** Even non-registered users can search by name. This is case-insensitive.
    - **ADDITIONAL FUNCTION:** Optimized the search output to hide unnecessary details like product id, etc.

14. **Search By Price Range**
    - **ROUTE:** `router.post("/searchByPrice", productController.searchByPrice)`
    - **MINIMUM REQUIREMENT:** Even non-registered users can search products through the price range they input.
    - **ADDITIONAL FUNCTION:** Optimized the search output to hide unnecessary details like product id, etc.

15. **Retrieve User's Cart**
    - **ROUTE:** `router.get("/get-cart", verify, cartController.getCart)`
    - **MINIMUM REQUIREMENT:** Registered users can retrieve their cart details.

16. **Add to Cart**
    - **ROUTE:** `router.put("/add-to-cart", verify, cartController.addToCart)`
    - **MINIMUM REQUIREMENT:** Registered users can add to their cart. Automatically computes the values for subtotal per cart item and the grand total of the cart.
    - **ADDITIONAL FEATURE:** The app will check first if there is enough stock left in the inventory based on the desired quantity. If the specific product is already in the user's cart, it will add the new quantity to the existing quantity on the cart.

17. **Change Product Quantity**
    - **ROUTE:** `router.put("/update-cart-quantity", verify, cartController.updateQuantity)`
    - **MINIMUM REQUIREMENT:** Allows registered users to change their desired quantity for a product in their cart.
    - **ADDITIONAL FEATURE:** The app will check first if there is enough stock left in the inventory to cover the new quantity.

18. **Remove Products from Cart**
    - **ROUTE:** `router.put("/:id/remove-from-cart", verify, cartController.removeItem)`
    - **MINIMUM REQUIREMENT:** Allows registered users to remove an item from their cart.

19. **Clear Cart**
    - **ROUTE:** `router.patch("/clear-cart", verify, cartController.clearCart)`
    - **MINIMUM REQUIREMENT:** Allows registered users to empty their cart.

20. **Non-Admin User Check-out**
    - **ROUTE:** `router.post("/checkout", verify, orderController.checkout)`
    - **MINIMUM REQUIREMENT:** Allows registered users to check out the items in their cart.
    - **ADDITIONAL FEATURE:** The app will check first if there is enough stock left in the inventory to cover the items the user wants to check out. Upon success, it will update the inventory of the product by deducting the quantity ordered by the registered user. If the specific product's quantity reaches 0, it will automatically be tagged as inactive. It will also empty the user's cart.

21. **Retrieve User's Order**
    - **ROUTE:** `router.get("/my-orders", verify, orderController.myOrder)`
    - **MINIMUM REQUIREMENT:** Allows registered users to view their ordered item list.
    - **ADDITIONAL FEATURE:** Optimized the search output to hide unnecessary details like order id, etc.

22. **Retrieve All Orders**
    - **ROUTE:** `router.get("/all-orders", verify, verifyAdmin, orderController.allOrders)`
    - **MINIMUM REQUIREMENT:** Allows an admin user to get the total order list by registered users.
    - **ADDITIONAL FEATURE:** Optimized the search output to hide unnecessary details like order id, etc.


## ADDITIONAL APP FEATURES

1. **Pay Single Order**
    - **ROUTE:** `router.post("/payment", verify, orderController.payment)`
    - **FEATURE:** Allows a registered user to pay a single order via User's Balance. Upon success, this will tag their order as paid and deduct the paid amount from the User's Balance.

2. **Pay All Orders**
    - **ROUTE:** `router.post("/pay-all-orders", verify, orderController.payAllPending)`
    - **FEATURE:** Allows a registered user to pay all pending orders via User's Balance. Upon success, this will tag their order as paid and deduct the paid amount from the User's Balance.


3. **Get Total Sale**
    - **ROUTE:** `router.get("/totalSales", verify, verifyAdmin, orderController.totalSales)`
    - **FEATURE:** Allows an admin user to get the total sales based on the orders that were tagged as paid.

4. **Get Total Sale of a Specific Product**
    - **ROUTE:** `router.get("/productSales", verify, verifyAdmin, orderController.productSales)`
    - **FEATURE:** Allows an admin user to get the total sales of a specific product.


5. **Search by Category**
    - **ROUTE:** `router.post("/searchByCategory", productController.searchByCategory)`
    - **FEATURE:** Even non-registered users can search products by the product category. The output is also optimized to remove details such as product id, etc.

6. **Update Product Inventory**
    - **ROUTE:** `router.patch("/update-inventory", verify, verifyAdmin, productController.updateInventory)`
    - **FEATURE:** Allows an admin user to update the inventory of a specific product.

7. **Write a Review**
    - **ROUTE:** `router.patch("/:id/writeReview", verify, productController.writeReview)`
    - **FEATURE:** Allows a registered user to add a review on a specific product. The app will check first if the user ordered and paid for a specific product before allowing a review.

8. **View All Reviews of a Product**
    - **ROUTE:** `router.get("/:id/viewReview", productController.viewReview)`
    - **FEATURE:** Even non-registered users are allowed to view the reviews on a specific product.

9. **View User's Balance**
    - **ROUTE:** `router.get("/viewBalance", verify, userController.viewBalance)`
    - **FEATURE:** Allows a registered user to view their available balance.

10. **Topping up the User's Available Balance**
    - **ROUTE:** `router.patch("/topUp", verify, userController.topUp)`
    - **FEATURE:** Allows a registered user to add an amount to the User's Available Balance.