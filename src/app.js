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

// CORS (supports cross-site cookies)
// CLIENT_URL can be a single origin or comma-separated list
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// sensible defaults for local dev (when CLIENT_URL isn't set)
if (allowedOrigins.length === 0) {
  allowedOrigins.push("http://localhost:5173");
}

const corsOptions = {
  origin: (origin, cb) => {
    // allow non-browser tools (Postman/curl) that send no Origin header
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Return a readable error (instead of silent network failure in the browser)
app.use((err, req, res, next) => {
  if (err && typeof err.message === "string" && err.message.startsWith("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }
  next(err);
});
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
    app.listen(PORT, () => {
})                   //now it can take requests

}).catch((err)=>{
});

