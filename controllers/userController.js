// Dependencies
const User = require("../models/User");
const Cart = require("../models/Cart")
const bcrypt = require('bcrypt');
const auth = require("../auth");

// Register user 
module.exports.registerUser = (req, res) => {
    if (!req.body.email.includes("@")){
        return res.status(400).send({error: "Email Invalid."});
    }
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({error: "Mobile number invalid."});
    }
    else if (req.body.password.length < 8) {
        return res.status(400).send({error: "Password must be atleast 8 characters."});
    }
    else {
        return User.find({ $or: [ { userName : req.body.userName }, { email: req.body.email }] })
		.then(result => {
			if(result.length > 0){
				return res.status(409).send({error: "Duplicate Email or Username already in use."});
			}else{
				let newUser = new User({
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    email : req.body.email,
                    userName: req.body.userName,
                    mobileNo : req.body.mobileNo,
                    password : bcrypt.hashSync(req.body.password, 10)
                })
        
                return newUser.save()
                .then((result) => {
                 res.status(201).send({message: "Registered successfully!", data: result})  
                    //Automaic adding a cart for every new user
                    let newCart = new Cart({
                        userId: result.id,
                        userName: result.userName
                    })
                    
                    return newCart.save()

                })
                .catch(err => res.status(500).send({error: "There is an error, please try again."}))
			};
		})
        .catch(error => res.status(500).send({error: "Internal Server Error."}))
    }
}

// login user
module.exports.loginUser = (req, res) => {
    // login using either username or email
    User.findOne({ $or: [ { userName : req.body.userName }, { email: req.body.email }] })
        .then(result => {
        if (!result){
            return res.status(404).send({error: "email / username does not exist"})
            
        }
        const isPasswordCorrect = bcrypt.compareSync(req.body.password,result.password)
        if(isPasswordCorrect){
            return res.status(200).send({access: auth.createAccessToken(result)})
            console.log(result)
        } else {
            return res.status(401).send("Email / username and password does not match")
        }
            
    })
    .catch(err => res.status(500).send(err))     
}

// Get user details

module.exports.getUserDetails = (req, res) => {
    return User.findById(req.user.id)
    .then(result =>{
        if(!result){
            return res.send({error: "User not found"})
        }
      result.password = "*******";
      return res.status(200).send(result);   
        
    })
    .catch(err => res.status(500).send({error: "Fetching profile"}))
}

// Set user as admin by an admin user

module.exports.updateAdmin = async (req, res) => {

    let updatedAdmin = {
        isAdmin: true
    }
    const result = await User.findOneAndUpdate({_id: req.params.id}, updatedAdmin);
    if (result) {
        res.status(200).send({ message: "Upgraded to admin successfully"});
    } else {
        res.status(404).send({ error: "User not found or there is a problem updating the user" });
    }
}

//  Update password

module.exports.updatePassword = async (req, res) => {
	try{
		const {newPassword} = req.body;
		const {id} = req.user;

		// Hash/encrypt the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await User.findByIdAndUpdate(id, {password: hashedPassword})


		res.status(200).json({message: "Password Updated Successfully!"});
	}catch(error){
		console.log(error);
		res.status(500).json({message: "Internal Server Error!"});
	}
}

// View Balance
module.exports.viewBalance = async (req, res) => {
    try{
        const wallet = await User.findById(req.user.id);
        if(!wallet){
            res.status(404).send({ error: "There is a problem retrieving User's available balance." });
        } else {
            res.status(200).send({User: wallet.userName, availableBalance: wallet.availableBalance});
        }
        
    }catch(error){
		console.log(error);
		res.status(500).json({message: "Internal Server Error!"});
	}
}

// Topping up account
module.exports.topUp = async (req, res) => {
    try{
        const wallet = await User.findById(req.user.id);
        const {amountToAdd} = req.body;

        if(!wallet){
            res.status(404).json({ error: "There is a problem retrieving User's available balance." });
        } else if(typeof amountToAdd != "number"){
            res.status(400).json({error: "Please input a valid number"})
        }else {
            wallet.availableBalance += amountToAdd;
            res.status(200).send({User: wallet.userName, amountAdded: amountToAdd, availableBalance: wallet.availableBalance});
            await wallet.save()
        }

    }catch(error){
		console.log(error);
		res.status(500).json({message: "Internal Server Error!"});
	}
}
