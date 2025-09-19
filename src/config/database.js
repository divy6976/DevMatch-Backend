const {mongoose}=require("mongoose")



const connectDB=async()=>{
    
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://divy:697640@namsatenode.3naepxm.mongodb.net/devTinder');
    
}

module.exports={connectDB}