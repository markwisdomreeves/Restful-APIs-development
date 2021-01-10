
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");



// @desc     Get / Show all bootcamps Course
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getAllBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});


// @desc     Get / Show a Single bootcamp
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Resource with this id not found: ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ 
        success: true,
        data: bootcamp
    });
});


// @desc     Create a Single bootcamp
// @route    POST /api/v1/bootcamps/:id
// @access   Private
exports.createSingleBootcamp = asyncHandler(async (req, res, next) => {

    // Add the login user to req, body
    req.body.user = req.user.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // if the user is not an admin, they can only add on bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User with this ID ${req.user.id} has already published a bootcamp`,
                400
            )
        );
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({ 
        success: true,
        data: bootcamp
    });
    
});

// @desc     Update a Single bootcamp
// @route    Update /api/v1/bootcamps/:id
// @access   Private
exports.updateSingleBootcamp = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Resource with this id not found: ${req.params.id}`, 404)
        );
    }

    // Make sure the user is the bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User with this ID ${req.user.id} is not authorized to update this bootcamp`, 401
            )
        );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: bootcamp
    });
    
});


// @desc     Delete a Single bootcamp
// @route    Delete /api/v1/bootcamps/:id
// @access   Private
exports.deleteSingleBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Resource with this id not found: ${req.params.id}`, 404)
        );
    }

    // Make sure the user is the bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
              `User with this ID ${req.user.id} is not authorized to delete this bootcamp`, 401
        )
      );
    }

    await bootcamp.romove();
   
    res.status(200).json({
        success: true,
        data: {}
    });
    
});


// @desc     Get bootcamps location within a radius
// @route    GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calculate radius using radians
    // Divide distance by the radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
    
});


// @desc     Upload Photo for bootcamp
// @route    PUT /api/v1/bootcamps/:id/photo
// @access   Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
         return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        ); 
    }

    // Make sure the user is the bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin' ) {
        return next(
            new ErrorResponse(
                `User with this ID ${req.user.id} is not authorized to update this bootcamp`, 401
            )
        );
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400))
    }

    // Get the file from the request - console(req.files.file);
    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400))
    }

    // Checking the file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400
            )
        );
    }

    // Create a custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with the file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        });
    });

});