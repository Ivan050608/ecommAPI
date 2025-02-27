//[SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const passport = require('passport');
const session = require('express-session');
// require('./passport');
//[SECTION] Routes
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");

//[SECTION] Environment Setup
require('dotenv').config()


//[SECTION] Server Setup
const app = express()

app.use(express.json())

//IMPORTANT NOTE:
/*
	By default our backend's CORS setting will prevent any application outside of our Express JS app to process requests to it. Using the cors package will allow us to manipulate this and control what applications may use our app
 - The "cors" package will allow our backend application to be available to our frontend application.


*/
const corsOptions = {
	origin: [
		'http://localhost:3000',
		'https://ecomm-full-three.vercel.app',
		'https://ecomm-full-ivans-projects-6f166288.vercel.app',
		'https://ecomm-full-git-main-ivans-projects-6f166288.vercel.app'
	], // Allow requests from this origin (The client's URL) the origin is in array form if there are multiple origins.
	credentials: true, //Allows credentials (e.g., cookies, authorization headers)
	methods: "GET,POST,PATCH,DELETE,PUT",
	allowedHeaders: "Content-Type,Authorization",
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

// [Section] Google Login
// Creates a session with the given data
// resave prevents the session from overwriting the secret while the session is active
// saveUninitialized prevents the data from storing data in the session while the data has not yet been initialized
// app.use(session({
//     secret: process.env.clientSecret,
//     resave: false,
//     saveUninitialized: false
// }));
// Initializes the passport package when the application runs
// app.use(passport.initialize());
// Creates a session using
//the passport package
// app.use(passport.session());


//[SECTION] Database connection
//We use the "process.env.<environment variable name> to call on the variables in our .env file"
mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))

//[SECTION] Backend Routes 
app.use("/b4/users", userRoutes);
app.use("/b4/products", productRoutes);
app.use("/b4/cart", cartRoutes);
app.use("/b4/orders", orderRoutes);

//[SECTION] Server Gateway Response
if(require.main === module){
	app.listen(process.env.PORT || 3000, ()=> {
		console.log(`API is now online on port ${process.env.PORT || 3000}`)
	})
}

module.exports = {app, mongoose}