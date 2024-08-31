const asyncerrorhandler = require('./AsyncErrorHandler');
const jwt = require('jsonwebtoken');
const user = require('../models/userModel');




exports.authenticate = asyncerrorhandler(async (req,res,next)=>{
    const {JWTtoken} = req.cookies;
    if(!JWTtoken){
        console.log('here lil')
        return next({message:"Please login",statusCode:401});
    }else{
        const DecodedData = jwt.verify(JWTtoken,process.env.SEC_KEY);
        req.user = await user.findById(DecodedData.id);
        next();
    }
})

exports.authenticatePermission = asyncerrorhandler(async (req,res,next)=>{
    const user = await req.user;
    if(!user){
        return next({message:"Please login",statusCode:401});  
    }else{
        if((user && (!user.AccessProvided || !user.Approved))){
            return next({message:"Access Denied",statusCode:403});      
         }else{
          next()
         }
    }
});



