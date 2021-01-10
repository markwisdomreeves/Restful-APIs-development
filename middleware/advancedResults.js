
const advancedResults = (model, populate) => async (req, res, next) => {

    let query;

    // Copy the req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Looping over the removeFields and delete them them reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create mongoose operators - 
    // greater than, great and equal to, less than, less than equal to, and in
    // ($gt, $gte, lt, lte, in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resourses
    query = model.find(JSON.parse(queryStr));

    // The Select Fields section
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // The Sorting section
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // The Pagination section
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    // Executing the query
    const results = await query;

    // Pagination resulr
    const Pagination = {};

    if (endIndex < total) {
        Pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        Pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        Pagination,
        data: results
    };

    next();

};


module.exports = advancedResults;