const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");


// LOAD  ENV VARIABLES
dotenv.config({ path: './config/config.env' });

// CONNECTING TO MONGODB DATABASE
connectDB();

// ROUTES FILE
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const users = require("./routes/users");
const reviews = require("./routes/reviews");
const auth = require("./routes/auth");

// EXPRESS CONNECTION
const app = express();

// APPLICATION MIDDLEWARES
// Setting up basic middleware for all Express requests
app.use(bodyParser.urlencoded({ extended: false }));

// body-parser
app.use(bodyParser.json());

// cookie-parser
app.use(cookieParser());

// Mongo Sanitize data hackers
app.use(mongoSanitize());

// Set security headers for hackers
app.use(helmet());

// Prevent XSS attacks for hackers
app.use(xss());

// Rate limiting for hackers
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});
app.use(limiter);

// Prevent http param pollution for hackers
app.use(hpp());

// Enable CORS
app.use(cors());

// Photo / File Uploading
app.use(fileupload());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set static folder in express
app.use(express.static(path.join(__dirname, 'public')));


// MOUNT ROUTES
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/auth', auth);

// THE ERROR MIDDLEWARES HAVE TO COME AFTER THE ROUTES
app.use(errorHandler);



// SERVER PORT
const port = process.env.PORT || 5000;

// STARTING THE SERVER
const server = app.listen(port, () => {
    console.log(`Server started in ${process.env.NODE_ENV} mode on port: ${port}`.yellow.bold);
});

// HANDLING GLOBAL ERROR FOR MONGODB DATABASE CONNECTION
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // CLOSE SERVER ON ERROR & EXIT PROCESS
    server.close(() => process.exit(1));
});