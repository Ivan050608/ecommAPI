const User = require('../models/User');
const Cart = require('../models/Cart')
const Product = require('../models/Product');
const Order = require('../models/Order');

//[SECTION] Checkout Order
module.exports.checkOutOrder = async (req, res) => {
    const userId = req.user.id; 

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId: userId });

        if (!cart || cart.cartItems.length === 0) {
            return res.status(400).send({
            
                // message: 'Cart is empty or not found'
                error: 'No Items to Checkout'
            });
        }

        // Create a new order
        const newOrder = new Order({
            userId: userId,
            productsOrdered: cart.cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                subtotal: item.subtotal
            })),
            totalPrice: cart.totalPrice,
            orderedOn: new Date()
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        // Clear the cart
        cart.cartItems = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(200).send({
            
            message: 'Ordered Successfully',
            orderDetails: {
                _id: savedOrder._id,
                userId: savedOrder.userId,
                productsOrdered: savedOrder.productsOrdered,
                totalPrice: savedOrder.totalPrice,
                orderedOn: savedOrder.orderedOn
            }
        });
    } catch (error) {
        res.status(500).send({
            
            message: 'An error occurred while processing the order',
            error: error.message
        });
    }
};

//[SECTION] Getting Order
module.exports.getMyOrders = async (req, res) => {
    const userId = req.user.id; 

    try {
        // Retrieve all orders made by the user
        const orders = await Order.find({ userId: userId });

        if (orders.length === 0) {
            return res.status(404).send({
                
                error: 'No orders found for the user'
            });
        }

        res.status(200).send({
            
            message: 'Orders retrieved successfully',
            orders: orders.map(order => ({
                _id: order._id,
                userId: order.userId,
                productsOrdered: order.productsOrdered,
                totalPrice: order.totalPrice,
                orderedOn: order.orderedOn
            }))
        });
    } catch (error) {
        res.status(500).send({
            
            message: 'An error occurred while retrieving orders',
            error: error.message
        });
    }
};

//[SECTION] Get all Order
module.exports.getAllOrders = async (req, res) => {
    try {
        // Retrieve all orders from the database
        const orders = await Order.find();

        if (orders.length === 0) {
            return res.status(404).send({
                
                error: 'No orders found'
            });
        }

        res.status(200).send({
            
            message: 'All orders retrieved successfully',
            orders: orders.map(order => ({
                _id: order._id,
                userId: order.userId,
                productsOrdered: order.productsOrdered,
                totalPrice: order.totalPrice,
                orderedOn: order.orderedOn
            }))
        });
    } catch (error) {
        res.status(500).send({
            
            message: 'An error occurred while retrieving all orders',
            error: error.message
        });
    }
};