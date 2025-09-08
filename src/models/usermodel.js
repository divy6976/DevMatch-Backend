const mongoose = require("mongoose");

const validator = require("validator");
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const userSchema = new mongoose.Schema({
    firstName: {
        type:String,
        required:true,
        
        trim:true,
  
        minLength:2,
        maxLength:20

    },
    lastName:{
        type:String,
        required:true,
     
        trim:true,
        minLength:2,
        maxLength:20
    },
    email:{
        type:String,
            
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
         validate: {
    validator: function(v) {
      return validator.isEmail(v);
    },
    message: props => `${props.value} is not a valid email!`
  }
        
    },
  password: {
  type: String,
  required: true,
  trim: true,
  minlength: 6,
  
  validate: {
    validator: function (value) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(value);
    },
    message: "Password must include uppercase, lowercase, number, and special character"
  }
}
,
    age:{
        type:Number,
        min:10,
     
    },
photoUrl: {
  type: String,
  default: "https://www.example.com/default.jpg",
  trim: true,
  validate: {
    validator: function(value) {
      if (value === undefined || value === null) return true;  // optional field
      if (value.trim().length < 5) return false;  // too short or empty string
      return /^(https?:\/\/).+\.(jpg|jpeg|png|gif|webp)$/i.test(value); // valid URL check
    },
    message: "Photo URL must be at least 5 characters long and a valid image URL"
  }
}


,


    gender:{
        type:String,
        
        enum: ["male", "female", "other", "Male", "Female", "Other", "MALE", "FEMALE", "OTHER"],
        trim:true,
        default:"male"

    },
    skills:{
        type:[String],
        trim:true,


    },
    about:{
        type:String,
        trim:true,
        default:"i am noob",
        maxLength:500,
        minLength:9
    }


},{
    timestamps:true

})

//creating jwt get method

userSchema.methods.getJWT=function(){ 
  const user=this
  const token=jwt.sign({id:user._id},"hellsdsadho",{expiresIn:"7d"})
  return token;
}


userSchema.pre("save",async function(next){
  if(this.isModified('password')){
    this.password= await bcrypt.hash(this.password,10);

  }
  

  next();
})






const User=mongoose.model("User",userSchema)   //User is the name of the collection

module.exports={User};