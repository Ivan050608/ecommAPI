//[SECTION] Activity: Dependencies and Modules
const express = require("express");
const productController = require("../controllers/product");

const auth = require("../auth");

const { verify, verifyAdmin } = require("../auth");

//[SECTION] Activity: Routing Component
const router = express.Router();

// //[SECTION] Activity: Route for creating a course
router.post("/", verify, verifyAdmin, productController.addProduct); 

// //[SECTION] Activity: Route for retrieving all courses
router.get("/all", verify, verifyAdmin, productController.getAllProduct);

// //[SECTION] Activity: Route for retrieving all active courses
router.get("/active", productController.getAllActive);


// //If you want to retrieve data, like getting a course by its ID, you should use the GET method
// //The route "/specific/:id" is for GET requests and has two parts:
// // /specific/: a fixed part of the route.
// // :id: A placeholder for the unique ID of the resource you want
// // The :id lets you handle requests for different resources by replcaing it with thei unique IDs
router.get("/:productId", productController.getProduct)

// //[SECTION] Route for updating a course (Admin)
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

// //[SECTION] Activity: Route to archiving a course (Admin)
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

// //[SECTION] Activity: Route to activating a course (Admin)
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

router.post('/search-by-name', productController.searchProductsByName);

router.post('/search-by-price', productController.searchProductsByPrice);


//[SECTION] Activity: Export Route System
// Allows us to export the "router" object that will be accessed in our "index.js" file
module.exports = router;