const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const User = require("../models/userModel");
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto')


//Register a User

exports.registerUSer = catchAsyncErrors( async(req, resp, next) => {

    const {  name, email, password} = req.body

    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"this_is_sample_id",
            url:"profile pic url"
        }
    });

    sendToken(user,201,resp)
});

//Login User

exports.loginUser = catchAsyncErrors( async (req, resp, next) => {

    const {email, password} = req.body;

    if(!email || !password) {
        return next(new ErrorHandler("Please enter email and password"), 400)
    }

    const user = await User.findOne({ email }).select("+password")

    if(!user) {
        return next(new ErrorHandler("Invalid email or password",401))
    }

    const isPasswordMatched = await user.comparePassword(password);


    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password",401))
    }

    

    sendToken(user,200,resp)

})

//Logout user

exports.logOut = catchAsyncErrors( async(req, resp, next) => {

    resp.cookie("token", null, {
        httpOnly:true,
        expires:new Date(Date.now())
    });


    resp.status(200).json({
        success:true,
        message: "Logged Out"
    });
})

// Forgot Password

exports.forgotPassword = catchAsyncErrors(async(req, resp, next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next( new ErrorHandler("User not found", 404))
    }

    // Get reset password token
    const restToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false})

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${restToken}`;

    const message = `Your password rest token is :-
                        ${resetPasswordUrl}
                        If you have not requested this email then please ignore it`;
    try {

        await sendEmail({
            email:user.email,
            subject:`WeShop Password Recovery`,
            message
        })


        resp.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })
        
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler(error.message, 500))
        
    }
})

// Reset Password

exports.resetPassword = catchAsyncErrors( async(req, resp, next) => {

    //Creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user= await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now()}
    });

    if (!user) {
        return next(new ErrorHandler("Reset password is invalid or has been expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password not matched", 400))

    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200, resp)

})


// Get User Details
exports.getUserDetails = catchAsyncErrors(async(req, resp, next) => {

    const user = await User.findById(req.user.id)

    resp.status(200).json({
        success:true,
        user
    })
})


// Update User Password
exports.updatePassword = catchAsyncErrors(async (req, resp, next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400))
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match", 400))
    }

    user.password = req.body.newPassword;

    await user.save()

    sendToken(user, 200, resp)
})

// Update User Profile
exports.updateProfile = catchAsyncErrors(async (req, resp, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    resp.status(200).json({
        success: true,
        user
    })
})

// Get All Users (admin)
exports.getAllUsers = catchAsyncErrors( async(req, resp, next) => {

    const users = await User.find();
    const numberOfUsers = await User.countDocuments()

    resp.status(200).json({
        success:true,
        numberOfUsers,
        users
    })

})

// Get single user details (admin)
exports.getUserDetails = catchAsyncErrors( async(req, resp, next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User not exist ${req.params.id}`, 400))
    }


    resp.status(200).json({
        success:true,
        user
    })
})


// Update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, resp, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    resp.status(200).json({
        success: true,
        
    })
})

// Delete User -- Admin
exports.deleteUser = catchAsyncErrors(async (req, resp, next) => {

    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler(`User not exist ${req.params.id}`, 400))
    }

    await user.remove()

    resp.status(200).json({
        success: true,
        message:"Use deleted successfully"
    })
})



























