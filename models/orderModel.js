const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    user:String,
    address:Object,
    payment:String,
    total:String,
    subtotal:String,
    discount:String,
    couponId:String,
    products:Array,
    orderedAt:{type:String,default:function(){
        return new Date().toDateString()
    }},
    status:{type:String,default:"Placed"},
    productsCount:Number,

})


const Order = mongoose.model("Order",orderSchema);

module.exports = Order;