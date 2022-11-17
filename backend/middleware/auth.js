const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel')


exports.isAuthenticatedUser = catchAsyncError( async(req, resp, next) => {
    const {token} = req.cookies;
    if(!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    

    req.user = await User.findById(decodedData.id);

    next()


})


exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // console.log(res)
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role: ${req.user.role} is not allowed to access this resource`,
                    403
                )
            );
        }

        next();
    };
};