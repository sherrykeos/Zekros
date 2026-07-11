require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("../auth/passport");

const apiRoutes = require("../routes/index.route");

const notFound = require("../middleware/notFound");
const errorHandler = require("../middleware/errorHandler");



const app = express();
app.use(cookieParser());

app.use(passport.initialize());


app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Mount all API routes under /api
app.use("/api", apiRoutes);

// Handle unknown routes
app.use(notFound);

// Handle unexpected errors
app.use(errorHandler);



module.exports = app;





// const express = require('express');
// const apiRoutes = require('./routes/index.route');
// const notFound = require('./middleware/notFound');
// const errorHandler = require('./middleware/errorHandler');

// const app = express();

// // 1. Enable JSON body parsing for incoming requests.
// app.use(express.json());

// /**
//  * A simple health check endpoint to verify the server is running.
//  * Useful for monitoring and deployment verification.
//  */
// app.get('/api/health', (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: 'Server is running.',
//         uptime: process.uptime(),
//     });
// });

// // 2. Mount the aggregated API routes.
// app.use('/api', apiRoutes);

// // 3. Register middleware for handling 404 Not Found errors.
// // This should be placed after all other routes.
// app.use(notFound);

// // 4. Register the global error handling middleware.
// // This must be the last piece of middleware.
// app.use(errorHandler);

// module.exports = app;





