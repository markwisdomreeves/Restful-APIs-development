const mongoose = require("mongoose");


const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: Number,
        required: [true, 'Please add a minimun skill'],
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minmun skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipsAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }

});


// Static method to get average cost of the course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ]);

    try {
        if (obj[0]) {
            await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
                averageCost:Math.ceil(obj[0].averageCost / 10) * 10,
            });
        } else {
            await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
                averageCost: undefined,
            });
        }
    } catch (error) {
        console.error(error);
    }

};

// Call getAverageCost after the document is save into the database
CourseSchema.post('save', async function() {
    await this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost after the document is remove into the database
CourseSchema.post('remove', async function() {
    await this.constructor.getAverageCost(this.bootcamp);
});



module.exports = mongoose.model('Course', CourseSchema);