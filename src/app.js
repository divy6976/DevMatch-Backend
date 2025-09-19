const express=require("express")
const bcrypt=require("bcrypt")
const validator=require("validator")
const cookieParser = require('cookie-parser');
const jwt=require("jsonwebtoken")
const cors=require("cors");
const dotenv=require("dotenv").config()


const app=express();
const PORT=process.env.PORT||7777


// Trust Render's proxy so secure cookies and protocol detection work correctly
app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' 
        ? 'https://your-frontend-domain.vercel.app'
        : "http://localhost:5173"),
    credentials: true,
}));
app.use(express.json());   //read the JSOn object and cinvert it into js object and add it to req.body
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "DevTinder API is running! 🚀",
        status: "success",
        endpoints: {
            auth: "/auth/*",
            profile: "/profile/*", 
            requests: "/requests/*",
            users: "/users/*"
        }
    });
});

const {User}=require("./models/usermodel")
const {connectDB}=require("./config/database")


const {authRouter}=require("./routes/authRouter")
const {profileRouter}=require("./routes/profileRouter")
const {requestRouter}=require("./routes/requestRouter");
const userRoutes = require("./routes/user");







app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)

app.use("/",userRoutes)
// ✅ mount at /user









connectDB()
.then(()=>{
    console.log("Database connected successfully");
    app.listen(PORT, () => {
    console.log("server is running at 7777")
})                   //now it can take requests

}).catch((err)=>{
    console.log("Database not connected");
});

