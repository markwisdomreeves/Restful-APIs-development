const ErrorResponse = require("../utils/errorResponse");


const errorHandler = (err, req, res, next) => {
    let error = {
        ...err
    };

    error.message = err.message;

    // Log to console for me to check
    console.log(err); // will display all errors objects
    console.log(err.stack.red);

    // Error message for mongoose ObjectId is a bad OdjectId
    if (err.name === 'CastError') {
        const message = `Resourse not found ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Error message for Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate values are not allowed';
        error = new ErrorResponse(message, 400);
    }

    // Error message for Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};


module.exports = errorHandler;