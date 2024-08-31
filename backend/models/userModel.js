const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    FirstName:{
        type:String,
        required:[true,"Please  provide your First name"],
     },
    LastName:{
        type:String,
        required:[true,"Please  provide your Last name"],
        maxlength:[30,"SecondName Cannot Exceed 30 Characters"],
    },
    Email:{
        type:String,
        required:[true,"Please Enter Your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a Valid Email"]
    },
    Password:{
        type:String,
        select:false,
        required:[true,"Please Provide A Password"],
    },
    MobileNumber:{
        type:Number,
    },
    AadhaarNumber:{
        type:Number,
    },
    Role:{
        type:String,
        default:"candidate",
    },
    AppliedRole:{
        type:String,
    },
    Approved:{
        type:Boolean,
        default:false
    },
    AccessProvided:{
        type:Boolean,
        default:false
    },
    ProjectAccess: [{type: mongoose.Schema.Types.ObjectId, ref: 'project' }],
    companies: [{
        company: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'company' 
        },
        role: { 
            type: String, 
            enum: ['admin', 'manager', 'employee'], 
            default: 'employee' 
        },
        joinedOn: {
            type: Date,
            default: Date.now
        },
    }],
    resetpasswordtoken:String,
    resetpasswordexpired:Date,
    OTP:String,
    OTPExpired:Date,
});

//hiding password
userSchema.pre("save",async function(next){
    if(!this.isModified("Password")){
        next();
    }
    this.Password = await bcrypt.hash(this.Password,10);    
})

//jwt token
 userSchema.methods.getjwtToken = function(){
    return jwt.sign({id:this._id},process.env.SEC_KEY,{
        expiresIn: process.env.jwtExpire
    });
};

//compare password
userSchema.methods.comparepassword = async function(enteredpassword){
    return  await  bcrypt.compare(enteredpassword,this.Password);
}

//resetpassword token
userSchema.methods.getResetPasswordToken = function(){
    //Generating Token
    const resetToken = crypto.randomBytes(20).toString('hex'); 

    //Hashing and adding to userschema

    this.resetpasswordtoken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetpasswordexpired = Date.now() + 10 * 60 * 1000;
   // this.resetpasswordexpired = Date.now() + 30 * 1000;

    return resetToken;
}

userSchema.methods.getOTP = function(){
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  const expires = Date.now() + 2 * 60 * 1000; // OTP valid for 2 minutes
 
 this.OTP = otp;
 this.OTPExpired = expires;
  return otp;
};



module.exports = mongoose.model("user",userSchema);