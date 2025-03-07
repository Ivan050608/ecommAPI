const express = require("express");
const orderController = require("../controllers/order");

const auth = require("../auth");

const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

router.post('/checkout', verify, orderController.checkOutOrder)


router.get('/my-orders', verify, orderController.getMyOrders)

router.get('/all-orders', verify, verifyAdmin, orderController.getAllOrders)



module.exports = router;