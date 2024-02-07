const mongoose  = require('mongoose');
const paymentSchema = new mongoose.Schema({
    order:Object,
    type:String,
    orderDetails:String,
})

const Payment = mongoose.model("Payment",paymentSchema);
module.exports = Payment;