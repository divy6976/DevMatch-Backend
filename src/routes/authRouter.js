const express=require('express')
const validator=require("validator")
const bcrypt=require("bcrypt")
const {isLoggedIn}=require("../middlewares/auth")
const cookieParser = require('cookie-parser');

const {User}=require("../models/usermodel")


const authRouter=express.Router();

//signup



authRouter.post("/signup", async (req, res) => {
    //validate the data
    //alagh se function likhne ki koi jrrut nhi 
  
  // Check if req.body exists before destructuring
  if (!req.body) {
    
    return res.status(400).send("Request body is missing. Please check Content-Type header.");
  }
  
  const { firstName, lastName, email, password, age } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send("All fields are required");
  }
   if (!validator.isEmail(email)) {
    return res.status(400).send("Invalid email ");
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Create new user document
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      age,
    });

    // Save new user (runs schema validations automatically)
    await newUser.save();

    res.send("User signup successful");
  } catch (err) {
    // Handle validation errors separately to provide useful feedback
    if (err.name === "ValidationError") {
      // Collect all validation error messages
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).send(messages.join(", "));
    }

    res.status(500).send("Internal Server Error");
  }
});


authRouter.post("/login",async(req,res)=>{
    //email password lo
    //validate kro
    //email se exist or nnot
        //pass veirfy
        //if all true token genertae through jwt
        //db me store
        // token bejdo
        //succes message bejdo
       
  const { email, password } = req.body;
 



  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }
   if (!validator.isEmail(email)) {
    return res.status(400).send("Invalid email ");
  }

                 try {
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send("Invalid Credentials");
  }

  const isMatch =await bcrypt.compare(password,user.password);

  if (!isMatch) {
    return res.status(400).send("Invalid Credentials");
  }


    const token=await user.getJWT()   //payload,secret key,options
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,                 // localhost -> false, prod -> true
      sameSite: isProd ? 'none' : 'lax', // localhost -> lax, prod -> none
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

  
res.status(200).json({
  data:user
})


} catch (err) {
  res.status(500).send("Login not successful");
}

})



// authenticate login or not
//if login  toh cookie expire krdo

authRouter.post("/logout",isLoggedIn,async(req,res)=>{
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie("token", null, { 
    expires: new Date(0),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  })
  res.send("Logout successful");

})


module.exports={
    authRouter
}