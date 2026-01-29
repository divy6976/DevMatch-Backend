const express=require('express')

const profileRouter=express.Router();
const {isLoggedIn}=require("../middlewares/auth")
const bcrypt=require("bcrypt")
const {User}=require("../models/usermodel")

const {validProfileData}=require("../utils/validation")
const validateUserProfile=require("../utils/Schemavaldiation")
const {validProfileEditPassword}=require("../utils/validation")



profileRouter.get("/profile/view", isLoggedIn, async (req, res) => {
  try {
    
    // Same secret key jo login me use kiya tha
  const userID = req.user;

const user = await User.findById(userID.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Cannot get the profile");
  }
});



profileRouter.patch("/profile/edit",isLoggedIn,validateUserProfile,async(req,res)=>{

  //sbse phle validate kor data
  //id nikalo token se
//findbyidandupdate me data send kro


const decoded=req.user;
try {
  const user = await User.findByIdAndUpdate(decoded.id, req.body, { new: true });
 
  if (!user) {
    return res.status(404).send("User not found");
  }
  res.status(200).json(user);
} catch (error) {
  res.status(500).send("Cannot update the profile");
}
})


profileRouter.post("/profile/password", isLoggedIn,validateUserProfile, async (req, res) => {
  if (!validProfileEditPassword(req, res)) {
    return res.status(400).send("Invalid profile edit data");
  }

  const { oldPassword, newPassword } = req.body;
  const id = req.user.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).send("Old password and new password are required");
  }
  const userFromDB = await User.findById(id).select("+password"); 
  try {
    const isMatch = await bcrypt.compare(oldPassword, userFromDB.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).json({
      message: "Password updated successfully"
    });
  } catch (error) {
    res.status(500).send("Cannot update the password");
  }
});






module.exports={
    profileRouter
}