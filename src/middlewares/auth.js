
const jwt=require("jsonwebtoken");

 
const isLoggedIn=(req,res,next)=>{
    //cookies se token lo
    //validate kro
    //verify kro jwt se
    //token  se data nikal 
    //re me obj bnade
    const token=req.cookies.token;
    if(!token){
        return res.status(401).send("You are not Logged In");
    }

    try {
        const decoded = jwt.verify(token, "hellsdsadho");
        const { id } = decoded;
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).send("Unauthorized: Invalid token");
    }
}

module.exports={
    isLoggedIn
}