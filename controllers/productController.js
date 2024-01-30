// Dependencies
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const isValidObjectId = mongoose.Types.ObjectId.isValid; //Checker if Valid ID

// Create product
module.exports.createProduct = (req, res) => {
    try {

        if(typeof req.body.inventory != 'number' || typeof req.body.price != "number"){
            return res.status(400).send({error: "inventory and price should be a number"})
        }
        
        let newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            inventory: req.body.inventory,
            category: req.body.category
        })

        Product.findOne({name: req.body.name})
        .then(existingProduct => {
            if(existingProduct){
                return res.status(409).send({error: "Product already exist"})
            }
            
            if (newProduct.inventory <= 0){
                newProduct.isActive = false
            } 
            
            return newProduct.save()
            .then((savedProduct) => res.status(201).send({
                message: "Product added succesfully!",
                data: savedProduct
            }))
            .catch(err => res.status(500).send({error: "Failed to add product."}))
        })
    
  
    }catch(err){
        res.status(500).send("Internal Server error")
    }

  
}

// Retrieve all products
module.exports.retrieveAllProducts = async (req, res) => {
    try {
        const allProducts = await Product.find({});

        if (allProducts.length <= 0) {
            res.status(200).send({ Error: "No products added yet" });
        } else {
            res.status(200).send({ Products: allProducts });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server error");
    }
}

// Retrieve active products only
module.exports.retrieveActiveProducts = (req, res) => {
    try {
        return Product.find({isActive: true})
        .select({_id: 0, createdOn: 0, __v: 0})
        .then(activeProducts => {
            if(activeProducts.length > 0){
                return res.status(200).send({Products: activeProducts})
            } else {
                return res.status(200).send("No products on sale")
            }
        })
        .catch(err => res.status(404).send({error: "Error looking for the active products"}))
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server error");
    }
   
}

// Retrieve single product
module.exports.retrieveSingleProduct = (req, res) => {
    try{
        return Product.findById(req.params.id)
        .select({_id: 0, createdOn: 0, __v: 0})
        .then(product => {
            if (!product) {
                return res.status(404).send({ error: "Product not found" });
            } else {
                if (product.inventory > 0 && product.isActive) {
                    return res.status(200).send({ product });
                } else {
                    return res.status(404).send({ message: "Product is out of stock" });
                }
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server error");
    }
}

// Update Product
module.exports.updateProduct = (req, res) => {
    try{
        let updateProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category
        }

        return Product.findByIdAndUpdate(req.params.id, updateProduct)
        .then(product => {
            if(product){
                res.status(201).send({message: "Product Updated successfully!", data: product});
            }else{
                res.status(404).send({error: "Product Update Failed"})
            }
        })
        .catch(err => res.status(500).send({error: "Error updating a product"})); 
       

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server error");
    }
}


// archive Product
module.exports.archiveProduct = (req, res) => {
    try{
        let updatedActiveField = {
        isActive: false
        }

        return Product.findByIdAndUpdate(req.params.id, updatedActiveField)
        .then(product => {
            if (product){
                    res.status(200).send({message: "Product archived successfully!", data: product})
            } else {
                res.status(404).send({error: "There is a problem archiving the Product"})
            }
        })
        .catch(err => res.status(500).send({error: "Archiving failed"})) 
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server error");
    }
}

// activate Product
module.exports.activateProduct = (req, res) => {
    try{
        let updatedActiveField = {
            isActive: true
        }

        return Product.findByIdAndUpdate(req.params.id, updatedActiveField)
        .then(product => {
                if (Product){
                    res.status(200).send({message: "Product activated successfully!", data: product})
            } else {
                res.status(404).send({error: "There is a problem activating the Product"})
            }
        })
        .catch(err => res.status(500).send({error: "Activating failed"}))        
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server error");
    }
}

module.exports.searchByName = async (req, res) => {
    try{
		const {productName} = req.body;

		// case insensitive
		const product = await Product.find({
			name: {$regex: productName, $options: 'i'}
		},{_id: 0, isActive: 0, createdOn: 0, __v: 0});
        if(product.length <= 0){
            res.send({message: "No product found!"})
        } 
		res.json(product);
	}catch(error){
		res.status(500).json({error: "Internal Server Error"});
	}

}

// Search by price
module.exports.searchByPrice = async (req, res) => {
    try{
		const {maxPrice, minPrice} = req.body;
        if(maxPrice < minPrice){
            return res.send({error: "Max Price is less than Min Price."})
        }
		const products = await Product.find({$and: [{
			price: {
				$gte: minPrice,
				$lte: maxPrice
			}
		}, {isActive: true}]},{_id: 0, isActive: 0, createdOn: 0, __v: 0});

        if(products.length <= 0){
            res.send({message: "No product within price range."})
        }
		res.send(products);
	}catch(error){
		res.status(500).json({error: "Internal Server Error"});
	}
}

//Search By Category
module.exports.searchByCategory = async (req, res) => {
    try{
		const {productCategory} = req.body;

		// case insensitive
		const product = await Product.find({
			category: {$regex: productCategory, $options: 'i'}
		},{_id: 0, isActive: 0, createdOn: 0, __v: 0});
        if(product.length <= 0){
            res.send({message: "No product found!"})
        } 
		res.json(product);
	}catch(error){
		res.status(500).json({error: "Internal Server Error"});
	}

}

module.exports.updateInventory = async (req, res) => {
    try {
        const { productId, inventory } = req.body;
    
        // Validate if productId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
    
        const updatedProduct = await Product.findById(productId);
    
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
    
        // Update the product inventory
        updatedProduct.inventory += inventory;
    
        // Save the updated product
        await updatedProduct.save();
    
        return res.status(201).json({ message: 'Inventory updated successfully', product: updatedProduct });
    
    } catch (error) {
        console.error(error);
    
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

// Write a review

module.exports.writeReview = async (req, res) => {
    try{
        // Validate if productId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const { star, comment} = req.body;
        const userId = req.user.id
        const updatedProduct =  await Product.findById(req.params.id, {isActive: 0, createdOn: 0});


        //review function available only after paying the product
        if(updatedProduct){
            const paidProduct = await Order.findOne(
                {
                    $and: [
                        {userId: userId},
                        {"productsOrdered.productId": req.params.id},
                        {status: "Paid"}
                    ]
                }
            )

            if(!paidProduct){
                return res.status(400).json({messaged: "Cannot add reviews, products should be ordered and paid to add review"})
            }
            if (star >5 || star <0){
            return res.status(404).json({error: "Please keep product star rating between 1 to 5 stars."})
            }

            const reviewedBy = req.user.id
            updatedProduct.reviews.push({reviewedBy, star, comment});
            
        } else {
                return res.status(404).send({error: "No product exists / Cannot find product"})
            }
        await updatedProduct.save();
        return res.status(200).json({ message: 'Review added to product successfully', updatedProduct });
    }      
    catch (error) {
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}


// view reviews of a specified product
module.exports.viewReview = async (req, res) => {
    try {
         // Validate if productId is a valid ObjectId
         if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send({ error: 'Invalid product ID' });
        }
        const specifiedProduct = await Product.findById(req.params.id, {'reviews._id': 0});
        if (!specifiedProduct){
            return res.status(404).send({error: "No product exists / Cannot find product"})
           
        } else {
            return res.status(200).send({ProductName: specifiedProduct.name, Reviews: specifiedProduct.reviews});
        }
    }
    catch (error) {
        // Include more details about the error in the response
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }


    
}
