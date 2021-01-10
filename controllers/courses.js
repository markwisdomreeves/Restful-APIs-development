const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course");



// @desc      Get All courses from the Courses Database
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getAllCourses = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        const courses = await Course.find({
            bootcamp: req.params.bootcampId
        });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});


// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Public
exports.getSingleCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: course
    });

});


// @desc      Add a single course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private - Only an admin user and an authenticated user can add a course and other
exports.addSingleCourse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`, 404)
        )
    };

    // Make sure the user is the bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User with this ID ${req.user.id} is not authorized to add a course to bootcamp with this ID ${bootcamp._id}`, 401
            )
        );
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });

});


// @desc      Update a course
// @route     PUT /api/v1/courses/:id
// @access    Private
exports.updateSingleCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
        );
    }

    // Make sure the user is the bootcamp owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User with this ID ${req.user.id} is not authorized to update course from bootcamp with this ID ${course._id}`, 401
            )
        );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    course.save();

    res.status(200).json({
        success: true,
        data: course
    });

});


// @desc      Delete a course
// @route     DELETE /api/v1/courses/:id
// @access    Private
exports.deleteSingleCourse = asyncHandler(async (req, res, next) => {
    
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(
            new ErrorResponse(`No course with id of ${req.params.id}`, 404)
        );
    }

    // Make sure the user is the bootcamp owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User with this ID ${req.user.id} is not authorized to delete course from bootcamp with this ID ${course._id}`, 404
            )
        );
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    });

});