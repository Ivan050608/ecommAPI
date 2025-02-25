const User = require('../models/User');

const Cart = require('../models/Cart')
const Product = require('../models/Product');


//[SECTION] Enroll a user to a course
/*
    Steps: 
        1. Retrieve the user's id
        2. Change the password to an empty string to hide the password
        3. Return the updated user record
*/

// Logging in = would result into a token at this point, the token is not yet decrypted.

//Through the verify method, it unwraps the token which allows us to access what's within the payload. = user id, user isAdmin, user email.

//Once a route has a verify method, we can expect that we have the properties coming from the payload as long as the token is legitimate. 



// module.exports.enroll = (req, res) => {
//     console.log(req.user.id)
//     console.log(req.body.enrolledCourses)


//     if(req.user.isAdmin){
//         return res.status(403).send(false)
//     }

//     let newEnrollment = new Enrollment ({
//         userId : req.user.id,
//         enrolledCourses: req.body.enrolledCourses,
//         totalPrice: req.body.totalPrice
//     })

//     return newEnrollment.save()
//     .then(enrolled => {
//         return res.status(201).send(true)
//     })
//     .catch(error => errorHandler(error, req, res))
// }

// //[SECTION] Activity: Get enrollments

//     Steps:
//     1. Use the mongoose method "find" to retrieve all enrollments for the logged in user
//     2. If no enrollments are found, return a 404 error. Else return a 200 status and the enrollment record

// module.exports.getEnrollments = (req, res) => {
//     return Enrollment.find({userId : req.user.id})
//         .then(enrollments => {
//             if (enrollments.length > 0) {
//                 return res.status(200).send(enrollments);
//             }
//             return res.status(404).send(false);
//         })
//         .catch(error => errorHandler(error, req, res));
// };

//[SECTION] RETRIEVE CART
module.exports.retrieveCart = async (req, res) => {
    const userId = req.user.id; 

    try {
        // Find the cart by userId
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).send({
                message: 'Cart not found for the user'
            });
        }

        res.status(200).send({
            message: 'Cart retrieved successfully',
            cart: {
                _id: cart._id,
                userId: cart.userId,
                cartItems: cart.cartItems,
                totalPrice: cart.totalPrice,
                orderedOn: cart.orderedOn
            }
        });
    } catch (error) {
        res.status(500).send({
            message: 'An error occurred while retrieving the cart',
            error: error.message
        });
    }
};

//[SECTION] ADD TO CART
module.exports.addToCart = async (req, res) => {
    const userId = req.user.id;  
    const { productId, quantity } = req.body;

    try {
        // Find the user's cart
        let cart = await Cart.findOne({ userId: userId });

        // If the user doesn't have a cart, create a new one
        if (!cart) {
            cart = new Cart({
                userId: userId,
                cartItems: [],
                totalPrice: 0
            });
        }

        // Find the product to calculate the subtotal
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({
                message: 'Product not found'
            });
        }

        const subtotal = product.price * quantity;

        // Check if the product is already in the cart
        const existingItemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

        if (existingItemIndex > -1) {
            // Product already exists in the cart, update quantity and subtotal
            cart.cartItems[existingItemIndex].quantity += quantity;
            cart.cartItems[existingItemIndex].subtotal = product.price * cart.cartItems[existingItemIndex].quantity;
        } else {
            // Product not in the cart, add new item
            cart.cartItems.push({
                productId: productId,
                quantity: quantity,
                subtotal: subtotal
            });
        }

        // Recalculate the total price of the cart
        let totalPrice = 0;
        cart.cartItems.forEach(item => {
            totalPrice += item.subtotal;
        });

        cart.totalPrice = totalPrice;

        // Save the cart
        await cart.save();

        res.status(200).send({
            message: 'Item added to cart successfully',
            cart: {
                _id: cart._id,
                userId: cart.userId,
                cartItems: cart.cartItems,
                totalPrice: cart.totalPrice,
                orderedOn: cart.orderedOn
            }
        });
    } catch (error) {
        res.status(500).send({
            message: 'An error occurred while adding the product to the cart',
            error: error.message
        });
    }
};

//[SECTION] UPDATE CART QUANTITY
module.exports.updateCartQuantity = async (req, res) => {
    const userId = req.user.id; 
    const { productId, quantity } = req.body;

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).send({
                message: 'Cart not found for the user'
            });
        }

        // Find the item in the cart
        const itemIndex = cart.cartItems.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).send({
                message: 'Product not found in the cart'
            });
        }

        // Update the quantity and subtotal for the product
        cart.cartItems[itemIndex].quantity = quantity;

        // Get the product price from the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({
                message: 'Product not found'
            });
        }

        cart.cartItems[itemIndex].subtotal = product.price * quantity;

        // Recalculate the total price of the cart
        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).send({
            message: 'Item quantity updated successfully',
            updatedCart: {
                _id: cart._id,
                userId: cart.userId,
                cartItems: cart.cartItems,
                totalPrice: cart.totalPrice,
                orderedOn: cart.orderedOn
            }
        });
    } catch (error) {
        res.status(500).send({
            message: 'An error occurred while updating the cart',
            error: error.message
        });
    }
};

//[SECTION] REMOVE FROM CART
module.exports.removeFromCart = async (req, res) => {
    const userId = req.user.id; 
    const productId = req.params.productId; 

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).send({
                
                message: 'Cart not found for the user'
            });
        }

        // Find the index of the product to remove
        const itemIndex = cart.cartItems.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).send({
                
                message: 'Item not found in cart'
            });
        }

        // Remove the product from the cartItems array
        cart.cartItems.splice(itemIndex, 1);

        // Recalculate the total price of the cart
        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).send({
            
            message: 'Item removed from cart successfully',
            updatedCart: {
                _id: cart._id,
                userId: cart.userId,
                cartItems: cart.cartItems,
                totalPrice: cart.totalPrice,
                orderedOn: cart.orderedOn
            }
        });
    } catch (error) {
        res.status(500).send({
            
            message: 'An error occurred while removing the item from the cart',
            error: error.message
        });
    }
};

//[SECTION] CLEAR CART
module.exports.clearCart = async (req, res) => {
    const userId = req.user.id; // Assuming the user ID is obtained from authentication middleware

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).send({
                
                message: 'Cart not found for the user'
            });
        }

        // Clear the cart
        cart.cartItems = [];
        cart.totalPrice = 0;

        // Save the updated cart
        await cart.save();

        res.status(200).send({
            message: 'Cart cleared successfully',
            cart: {
                _id: cart._id,
                userId: cart.userId,
                cartItems: cart.cartItems,
                totalPrice: cart.totalPrice,
                orderedOn: cart.orderedOn
            }
        });
    } catch (error) {
        res.status(500).send({
            
            message: 'An error occurred while clearing the cart',
            error: error.message
        });
    }
};