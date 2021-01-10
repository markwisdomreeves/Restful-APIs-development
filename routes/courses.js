const express = require('express');
const {
    getAllCourses,
    getSingleCourse,
    addSingleCourse,
    updateSingleCourse,
    deleteSingleCourse
} = require("../controllers/courses");


const Course = require('../models/Course');

// Inother for the merging of courses routes in the bootcamps route 
// to work, we use mergeParams: true
const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");


router
    .route('/')
    .get(advancedResults(Course, {
        path: 'bootcamp',
        select: 'name description'
    }),
     getAllCourses
    )
    .post(protect, authorize('publisher', 'admin'), addSingleCourse);


router
    .route('/:id')
    .get(getSingleCourse)
    .put(protect, authorize('publisher', 'admin'), updateSingleCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteSingleCourse);
     


module.exports = router;