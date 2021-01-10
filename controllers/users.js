const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");


// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(req.advancedResults);
});

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getSingleUser = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
          new ErrorResponse(`No user found with the id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc      Create single user
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createSingleUser = asyncHandler(async (req, res, next) => {

    const user = await User.create(req.body);

    if (!user) {
        return next(
          new ErrorResponse(`No user found with the id of ${req.params.id}`, 404)
        );
    }

    res.status(201).json({
        success: true,
        data: user
    });
});

// @desc      Update single user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.updateSingleUser = asyncHandler(async (req, res, next) => {

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(
          new ErrorResponse(`No user found with the id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc      Delete single user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
exports.deleteSingleUser = asyncHandler(async (req, res, next) => {

    const user = await User.findOneAndDelete(req.params.id);

    if (!user) {
        return next(
        new ErrorResponse(`No user found with the id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

