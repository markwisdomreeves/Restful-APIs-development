const express = require("express");
const {
    getAllUsers,
    getSingleUser,
    createSingleUser,
    updateSingleUser,
    deleteSingleUser
} = require("../controllers/users");

const User = require("../models/User");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(advancedResults(User), getAllUsers)
    .post(createSingleUser);

router.route('/:id')
    .get(getSingleUser)
    .put(updateSingleUser)
    .delete(deleteSingleUser);



module.exports = router;