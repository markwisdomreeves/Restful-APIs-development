const express = require('express');
const {
    getAllReviews,
    getSingleReview,
    addSingleReview,
    updateSingleReview,
    deleteSingleReview
} = require("../controllers/reviews");

const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");


router.route('/')
    .get(
        advancedResults(Review, {
            path: 'bootcamp',
            select: 'name description'
        }),
        getAllReviews
    )
    .post(protect, authorize('user', 'admin'), addSingleReview);

router.route('/:id')
    .get(getSingleReview)
    .put(protect, authorize('user', 'admin'), updateSingleReview)
    .delete(protect, authorize('user', 'admin'), deleteSingleReview);



module.exports = router;

