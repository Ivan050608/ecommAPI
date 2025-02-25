//[SECTION] Activity: Dependencies and Modules
const Product = require("../models/Product");
const { errorHandler } = require('../auth');

//[SECTION] Activity: Create a course
/*
    Steps: 
    1. Instantiate a new object using the Course model and the request body data
    2. Save the record in the database using the mongoose method "save"
    3. Use the "then" method to send a response back to the client appliction based on the result of the "save" method
*/
// module.exports.addCourse = (req, res) => {

//     // Creates a variable "newCourse" and instantiates a new "Course" object using the mongoose model
//     // Uses the information from the request body to provide all the necessary information
//     let newCourse = new Course({
//         name : req.body.name,
//         description : req.body.description,
//         price : req.body.price
//     });

//     // Saves the created object to our database
//     return newCourse.save()
//     .then(result => res.status(201)(result))
//     //Error handling is done using .catch() to capture any errors that occur during an operation(like saving a course in a database)

//     //.catch(err => res.send(err)) captures the error and takes action by sending it back to the client/Postman with the use of "res.send"
//     .catch(error => errorHandler(error, req, res))
// }; 


module.exports.addProduct = (req, res) => {

    let newProduct = new Product({
        name: req.body.name, 
        description: req.body.description, 
        price: req.body.price
    });

//     // Check if a course with the same name already exists in the database.
    Product.findOne({ name: req.body.name })
    .then(existingProduct => { 
        if (existingProduct) {
//             // If a course with the same name exists, send a 409 (Conflict) status with "true".

//             // Notice that we didn't response directly in string, instead we added an object with a value of a string. This is a proper response from API to Client. Direct string will only cause an error when connecting it to your frontend.
            
//             // using res.send({ key: value }) is a common and appropriate way to structure a response from an API to the client. This approach allows you to send structured data back to the client in the form of a JSON object, where "key" represents a specific piece of data or a property, and "value" is the corresponding value associated with that key.
            return res.status(409).send({ message: 'Product already exists' });
        } else {
            // If no course with the same name exists, save the new course to the database.
            return newProduct.save()
            .then(result => 
//                 // If the course is saved successfully, send a 201 (Created) status with the saved course details.
//                 /*
//                     Response Body is a json object containing key-value pairs

//                     - success: true - sent a boolean value "true" which indicates that the course was added successfully

//                     - message: 'Course added successfully' - descriptive message indicating thet the course was added successfully. this will provcide clarity to the feedback sent to the client.

//                     - result: additional details about the newly created course. This can be a way to provide the information without needing to make an additional request
//                 */
                res.status(201).send({
                    success: true,
                    message: 'Product added successfully',
                    result: result
                })
            )
            .catch(error => 
                // If there's an error during the saving process, handle it using errorHandler.
                errorHandler(error, req, res)
            );
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// //[SECTION] Activity: Retrieve all courses
module.exports.getAllProduct = (req, res) => {

    return Product.find({})
    .then(result => {
//         // if the result is not null send status 30 and its result
        if(result.length > 0){
//             // This provides the client with the requested data in a clear and structured manner. So no need to add any more information
            return res.status(200).send(result);
        }
        else{
//             // 404 for not found courses
//             // Added a response object message indicating that there were no courses found
            return res.status(404).send({ message: 'No products found' });
        }
    })
    .catch(error => errorHandler(error, req, res));

};


// /*
//     Use of Promise.catch()
// - What is a promse? A promise in JavaScript is like a "guarantee" that will something will happen later, this can either be a success or a failure.
// */

// //[SECTION] Retrieve all active courses
// /*
//     Steps: 
//     1. Retrieve all courses using the mongoose "find" method with the "isActive" field values equal to "true"
//     2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
// */

module.exports.getAllActive = (req, res) => {

    Product.find({ isActive: true })
    .then(result => {
        // if the result is not null
        if (result.length > 0){
            // send the result as a response
            return res.status(200).send(result);
        }
        // if there are no results found
        else {
            // send the message as the response
            return res.status(404).send(false)
        }
    })
    .catch(error => errorHandler(error, req, res));

};

// //[SECTION] Retrieve a specific course
// /*
//     Steps: 
//     1. Retrieve a course using the mongoose "findById" method
//     2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
// */
module.exports.getProduct = (req, res) => {

    Product.findById(req.params.productId)
    .then(product => {
        if(product) {
            return res.status(200).send(product);
        } else {
            return res.status(404).send(false);
        }
    })
    .catch(error => errorHandler(error, req, res))
    
};

// //[SECTION] Update a course

//     Steps: 
//     1. Create an object containing the data from the request body
//     2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
//     3. Use the "then" method to send a response back to the client appliction based on the result of the "find" method

module.exports.updateProduct = (req, res)=>{

    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

//     // findByIdandUpdate() finds the the document in the db and updates it automatically
//     // req.body is used to retrieve data from the request body, commonly through form submission
//     // req.params is used to retrieve data from the request parameters or the url
//     // req.params.courseId - the id used as the reference to find the document in the db retrieved from the url
//     // updatedCourse - the updates to be made in the document
    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {
        if (product) {
             res.status(200).send({
                success: true,
                message: 'Product updated successfully'
            });

        } else {
            res.status(404).send({
                success: false,
                message: 'Product not found'
            });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// //[SECTION] Archive a course
// /*
//     Steps: 
//     1. Create an object and with the keys to be updated in the record
//     2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
//     3. If a course is updated send a response of "true" else send "false"
//     4. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
// */
module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {
        isActive: false
    }

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
//         // Check if a course was found
        if (product) {
//             // If course found, check if it was already archived
            if (!product.isActive) {
//                 // If course already archived, return a 200 status with a message indicating "Course already archived".
                return res.status(200).send({
            message: 'Product already archived',
            productDetails: product // Include the product details here
        });
    }
//             // If course not archived, return a 200 status with a boolean true.
            return res.status(200).send({
                success: true,
                message: 'Product archived successfully'
            });
        } else {
//             // If course not found, return a 404 status with a boolean false.
            return res.status(404).send({error: 'Product not found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};


// //[SECTION] Activate a course
// /*
//     Steps: 
//     1. Create an object and with the keys to be updated in the record
//     2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
//     3. If the user is an admin, update a course else send a response of "false"
//     4. If a course is updated send a response of "true" else send "false"
//     5. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
// */
module.exports.activateProduct = (req, res) => {

    let updateActiveField = {
        isActive: true
    }
    
    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
//         // Check if a course was found
        if (product) {
//             // If course found, check if it was already activated
            if (product.isActive) {
//                 // If course already activated, return a 200 status with a message indicating "Course already activated".

            return res.status(200).send({
            message: 'Product already active',
            productDetails: product // Include the product details here
        });
    }
//             // If course not yet activated, return a 200 status with a boolean true.
            return res.status(200).send({
                success: true,
                message: 'Product activated successfully'
            });
        } else {
//             // If course not found, return a 404 status with a boolean false.
            return res.status(404).send(false);
        }
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.searchProductsByName = async (req, res) => {
  try {
    const { name } = req.body;

    // Use a regular expression to perform a case-insensitive search
    const product = await Product.find({
      name: { $regex: name, $options: 'i' }
    });

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.searchProductsByPrice = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;

    // Validate the input
    if (minPrice === undefined || maxPrice === undefined) {
      return res.status(400).json({ message: 'Both minPrice and maxPrice are required.' });
    }

    // Find courses within the price range
    const products = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice },
    });

    return res.status(200).json({ products });
  } catch (error) {
    console.error('Error searching courses by price range:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};