const asyncerrorhandler = require('../middleWares/AsyncErrorHandler');
const User = require('../models/userModel');
const sendToken = require('../utils/JWTtoken');
const {run} = require('../controllers/awsController');
const crypto = require('crypto');



//Register User Using Email
exports.registerUser = asyncerrorhandler(async(req,res,next)=>{
    const {FirstName,LastName,Email,Password,ConfirmPassword,MobileNumber,AadhaarNumber}=req.body;
 
    if(FirstName && LastName && Email && Password && ConfirmPassword && MobileNumber && AadhaarNumber){
        if(Password!==ConfirmPassword){
            return next({message:'Passwords Do Not Match',statusCode:403});
           }else{
               const UserExists = await User.findOne({
                $or: [
                  { Email: Email },
                  { MobileNumber: MobileNumber }
                ]
              });
               if(UserExists){
                  return next({message:'User already Exists LogIn Instead',statusCode:404});
                }else{
                const user = await User.create({
                    FirstName,
                    LastName,
                    Email,
                    Password,
                    AadhaarNumber,
                    MobileNumber,
                 //   AccessProvided:Role==='intern'?false:true, //Interns don't have access by default But Managers Do
                  });
                  const head = `Hey ${FirstName} Welcome To Card Casa`;
                  const Message = `This Email was Sent From Card Casa Internship Tracker`
                  const subject = `Welocme To Card Casa, hey ${FirstName}`
                  const EmailSent = await run(Email,head,subject,Message);
                  if(EmailSent){
                  sendToken(user,200,res); 
                  }
                }
           }
    }else{
        return next({message:'UnAuthorized,Please Provide All Fields',statusCode:403});
    }
 });

//Login User With Email
exports.loginUser= asyncerrorhandler(async(req,res,next)=>{
    const {Email,Password} = req.body;
  
    if(!Email || !Password){
      return next({message: 'Please Enter Email And Password', statusCode: 400})
    }else{
        const user = await User.findOne({Email}).select('+Password');

  
        if(!user){
          return next({message:'User Does Not Exists, Check Your Email and Password again',statusCode:404});
        }else{
            const passwordmatched = user? await user.comparepassword(Password):await admin.comparepassword(Password);
        if(!passwordmatched){
          return next({message:'Incorrect Email or password',statusCode:401});
        }else{
        sendToken(user,200,res);
      }
        }   
    }
   });
  
 //logout
exports.logout = asyncerrorhandler(async (req,res,next)=>{
    res.cookie('JWTtoken',null,{
        expires: new Date(Date.now()),
        httpOnly: true,
        path:'/',
        secure: true,
     });  
    res.status(200).json({success:true,message:"logged out"});
  });


  
//Load User On Reload 
exports.LoadUser = asyncerrorhandler(async(req,res,next)=>{
const {companyId} = req.body;
  if(req.user){
  const user = await User.findById(req.user.id);
  if(companyId){
   const companySelected = user.companies.find(comp=>comp.company===companyId);
   if(companySelected){
    console.log(companySelected,'company Selected');
    user.Role = companySelected.role;
    await user.save();
   }
  }else{
    user.Role = 'Candidate'
    await user.save()
  }
  res.status(200).json({
      success:true,
      user      
  });
  }else{
    return next({message:'Please Login',statusCode:401});
  }
});


//Get All Users with AccessProvided For A project
exports.getAllUsersWithProjectAccess = asyncerrorhandler(async(req,res,next)=>{
const {projectID} = req.body;
        
      if(projectID){
       const query = {
        $or: [
          { ProjectAccess: projectID },
          { Role: "admin" },
        ],
        Approved:true
       }
                 const UsersWithAccess = await User.find(query).populate([
                  {
                  path:'ProjectAccess',
                  model:'project',
                  select:'ProjectName'
                 },
              ]);
       
        if(UsersWithAccess){
          res.status(200).json({success:true,UsersWithAccess});
        }
      }else{
        return next({message:'Please Provide a Project ID',statusCode:403});      
      }

});


// Forgot Password
exports.forgotPassword = asyncerrorhandler(async (req, res, next) => {
  const user = await User.findOne({ Email: req.body.Email });

  if (!user) {
      return next({ message: 'User not found with this email', statusCode: 404 });
  }

  // Generate reset token using the method in your schema
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://localhost:5173/password/reset/${resetToken}`;

  // Send the reset email
  try {
    // Prepare email details
  const head = `Hey ${user.FirstName}, Password Reset Request Received`;
  const Message = `
    <p>You have requested a password reset. Please click on the link below to reset your password:</p>
    <a href="${resetUrl}" style="color: #4CAF50; text-decoration: none;">Reset Password</a>
    <p>This link will expire in 10 minutes. If you did not request a password reset, please ignore this email and DO NOT CLICK ANY LINKS.</p>
  `;
  const subject = `Password Reset Request - Internship Tracker`;
                    await run(user.Email,head,subject,Message);

      res.status(200).json({ success: true, message: 'Email sent to ' + user.Email });
  } catch (error) {
    console.log(error);
      // If there is an error, reset the token fields
      user.resetpasswordtoken = undefined;
      user.resetpasswordexpired = undefined;

      await user.save({ validateBeforeSave: false });

      return next({ message: 'Email could not be sent', statusCode: 500,error:error });
  }
});

exports.validateToken = asyncerrorhandler(async(req,res,next)=>{
  const {Token} = req.body;
  if(Token){
  // Hash the token received in the URL
  const resetPasswordToken = crypto.createHash('sha256').update(Token).digest('hex');

  // Find the user by the token and ensure it's not expired
  const user = await User.findOne({
      resetpasswordtoken: resetPasswordToken,
  });

  if (!user) {
      return next({ message: 'Invalid or expired token', statusCode: 400 });
  }else{
    if(user.resetpasswordexpired < Date.now()){
 // Token is expired, clear the token and expiration fields
 user.resetpasswordtoken = undefined;
 user.resetpasswordexpired = undefined;
 await user.save({ validateBeforeSave: false });

 return next({ message: 'Invalid or expired token', statusCode: 400 });

    }else{
    res.json({success:true,user});
    }
  }
}else{
  return next({ message: 'pls provide a token', statusCode: 404 });
}
});

// Reset Password
exports.resetPassword = asyncerrorhandler(async (req, res, next) => {
  
  const {Token} = req.body;
  if(Token){
  // Hash the token received in the URL
  const resetPasswordToken = crypto.createHash('sha256').update(Token).digest('hex');

  // Find the user by the token and ensure it's not expired
  const user = await User.findOne({
      resetpasswordtoken: resetPasswordToken
      //resetpasswordexpired: { $gt: Date.now() }
  });

  if (!user) {
      return next({ message: `${resetPasswordToken} Invalid or expired token`, statusCode: 400 });
  }

  if(user){
    if(user.resetpasswordexpired < Date.now()){
      // Token is expired, clear the token and expiration fields
      user.resetpasswordtoken = undefined;
      user.resetpasswordexpired = undefined;
      await user.save({ validateBeforeSave: false });
     
      return next({ message: 'cleared Invalid or expired token ', statusCode: 400 });
     
         }
  }

  // Check if passwords match
  if (req.body.Password !== req.body.ConfirmPassword) {
      return next({ message: 'Passwords do not match', statusCode: 400 });
  }

  // Set the new password
  user.Password = req.body.Password;
  user.resetpasswordtoken = undefined;
  user.resetpasswordexpired = undefined;

  await user.save();

  const head = `Your Password Has Been Successfully Changed`;
  const message = `Hello ${user.FirstName},\n\nYour password has been successfully changed on ${new Date().toLocaleString()}. If you did not request this change, please contact support immediately.\n\nThank you,\nThe Team`;
  const subject = `Password Changed Successfully`;

  const passwordChangedEmail = await run(user.Email,head,subject,message);

  if(passwordChangedEmail){
    console.log(passwordChangedEmail);
  }
  return res.status(200).json({message:'Password Changed Successfully Please Login',Success:true});
}else{
  return next({ message: 'Token Not provided', statusCode: 404 });
}
});


//Send OTP 
exports.sendOTP = asyncerrorhandler(async (req, res, next) => {
 const {email} = req.body;
 
 if(email){
  const user = await User.findOne({ Email: email });

  if (!user) {
    return next({ message: 'User not found with this email', statusCode: 404 });
  }

  // Generate OTP using the method in your schema
  const otp = user.getOTP();

  await user.save({ validateBeforeSave: false });

  // Send the OTP via email
  try {
    const head = `Hey ${user.FirstName}, Here is Your OTP`;
    const message = `
      <p>Your OTP for verification is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for 2 minutes. Please enter it in the required field to verify your identity.</p>
    `;
    const subject = `Your OTP - Internship Tracker`;

    await run(user.Email, head, subject, message);

    res.status(200).json({ success: true, message: 'OTP sent to ' + user.Email });
  } catch (error) {
    console.log(error);

    // If there is an error, reset the OTP fields
    user.OTP = undefined;
    user.OTPExpired = undefined;

    await user.save({ validateBeforeSave: false });

    return next({ message: 'OTP could not be sent', statusCode: 500, error });
  }
  }else{
    return next({ message: 'Please Provied the Email', statusCode: 404, error });
  }
});


//check Otp Exists
exports.OtpExists = asyncerrorhandler(async (req,res,next)=>{
  const {email} = req.body;
  if(email){
    const user = await User.findOne({Email:email});
    if(user){
    const otp = user.OTP;
   const OTPExpired = user.OTPExpired?user.OTPExpired < Date.now()?true:false :false;
    if(otp){
      res.status(200).json({Success:true,message:'Otp does Exist',OTPExpired:OTPExpired});
    }else{
      res.status(200).json({Success:false,message:'Otp does Not Exists',OTPExpired:OTPExpired});
    }
    }else{
      return next({ message: 'User Does Not Exist', statusCode: 404, error });    
    }
  }else{
    return next({ message: 'Please Provied the Email', statusCode: 404, error });  
  }
})

//Validate OTP
exports.validateOTP = asyncerrorhandler(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next({ message: 'Please provide an OTP', statusCode: 400 });
  }

  // Find the user by the OTP and ensure it's not expired
  const user = await User.findOne({
    OTP: otp,
  });

  if (!user) {
    return next({ message: 'Invalid OTP', statusCode: 400 });
  }

  if(user){
    if(user.OTPExpired < Date.now()){
      // Token is expired, clear the token and expiration fields
      user.OTP = undefined;
      user.OTPExpired = undefined;
      await user.save({ validateBeforeSave: false });
     
      return next({ message: 'cleared Invalid or expired OTP ', statusCode: 400 });
         }else{
           // OTP is valid
           user.OTP = undefined;
      user.OTPExpired = undefined;
      await user.save({ validateBeforeSave: false });
           sendToken(user,200,res);
         // res.status(200).json({ success: true, message: 'OTP is valid', user });
         }
}
 });



//Update User Profile/Info
exports.UpdateUserProfile = asyncerrorhandler(async(req,res,next)=>{
const {FirstName,LastName,Email,MobileNumber,AadhaarNumber} = req.body;
const user = req.user;
if(user){
if(FirstName || LastName || Email || MobileNumber || AadhaarNumber){
     
const UpdateDataObject = {};

if(FirstName && user.FirstName!==FirstName){
  UpdateDataObject.FirstName = FirstName
}

if(LastName && user.LastName!==LastName){
  UpdateDataObject.LastName = LastName
}

if(Email && user.Email!==Email){
  UpdateDataObject.Email = Email
}

if(MobileNumber && user.MobileNumber!==MobileNumber){
  UpdateDataObject.MobileNumber = MobileNumber
}

if(AadhaarNumber && user.AadhaarNumber!==AadhaarNumber){
  UpdateDataObject.AadhaarNumber = AadhaarNumber
}

const updatedUser = await User.findByIdAndUpdate(user._id,UpdateDataObject);

if(updatedUser){
  res.status(200).json({message:'User Updated Successfully',user:updatedUser});
}else{
  return next({ message: 'Failed to update user profile', statusCode: 500 });
}

}else{
  return next({ message: 'Please provide Atleast one Field To Update', statusCode: 404 });
}
}else{
  return next({ message: 'Please LogIn', statusCode: 403 });
}
});

