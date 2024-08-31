const sendtoken = (user,statuscode,res)=>{
    const JWTtoken = user.getjwtToken();

    const options = {
        expires:new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        path:'/',
        secure: true, // if frontend is served over HTTPS
        sameSite: 'none'   
    };
    res.status(statuscode).cookie('JWTtoken',JWTtoken,options).json({success:true,user,JWTtoken});
}

module.exports = sendtoken;