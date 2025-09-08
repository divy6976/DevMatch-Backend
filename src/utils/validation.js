

const validProfileData=(req,res)=>{
    const AllowedFields=["firstName","lastName","photurl","gender","skills","about"];
    

    //loop lra req ki hr ek field pr and check krrhe alowed fiels me wo include h ya nhi
    const isValid=Object.keys(req.body).every((field)=> AllowedFields.includes(field))



    return isValid;


}



const validProfileEditPassword=(req,res)=>{
    const AllowedFields=["oldPassword","newPassword"];
    //loop lra req ki hr ek field pr and check krrhe alowed fiels me wo include h ya nhi
    const isValid=Object.keys(req.body).every((field)=> AllowedFields.includes(field))
    return isValid;
}



module.exports={
    validProfileData,
    validProfileEditPassword
}