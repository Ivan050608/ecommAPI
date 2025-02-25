//[Section] Activity
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'is Required']
    },
    productsOrdered: [
        {
            productId: {
                type: String,
                required: [true, "ID is required"]
            },
            quantity: {
                type: Number,
                required: [true, "is required"]
            },
            subtotal: {
                type: Number,
                required: [true, "is required"]
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: [true, "is required"]
    },
    orderedOn: {
        type: Date,
        default: new Date()
    },
});

module.exports = mongoose.model('Order', orderSchema);