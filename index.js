require("dotenv").config();
// Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");

// Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");





// Server setup
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Database connection
mongoose.connect(process.env.db);
mongoose.connection.once('open', () => console.log('Now connected to MongoDB'))

// Backend routes 
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/carts", cartRoutes);



// Server Gateway Response
if(require.main === module){
	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on port ${process.env.PORT || port}`)
	});
}

module.exports = app;