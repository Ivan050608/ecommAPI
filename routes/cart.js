const express = require("express");
const cartController = require("../controllers/cart");

const auth = require("../auth");

const { verify } = require("../auth");

const router = express.Router();

router.get('/get-cart', verify, cartController.retrieveCart)

router.post('/add-to-cart', verify, cartController.addToCart)

router.patch('/update-cart-quantity', verify, cartController.updateCartQuantity)

router.patch('/:productId/remove-from-cart', verify, cartController.removeFromCart)

router.put('/clear-cart', verify, cartController.clearCart)

// //[SECTION] Activity: Route to get the user's enrollements array
// router.get('/get-enrollments', verify, enrollmentController.getEnrollments);

module.exports = router;