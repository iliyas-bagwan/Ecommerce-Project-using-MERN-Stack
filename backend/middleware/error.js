const ErrorHandler = require('../utils/ErrorHandler')

module.exports = (err, req, resp, next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Wrong Mongo DB ID error
    if(err.name === 'CastError'){
        const message = `Resource not found. Invalid: ${err.path}`;

        err = new ErrorHandler(message, 400)
    }


    // Mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ErrorHandler(message, 400)
    }

    // Wrong JWT error
    if(err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again`
        err = new ErrorHandler(message, 400)
    }


    // JWT Expire error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is expired, Try again`
        err = new ErrorHandler(message, 400)
    }

    resp.status(err.statusCode).json({
        success:false,
        message:err.stack
    })
}