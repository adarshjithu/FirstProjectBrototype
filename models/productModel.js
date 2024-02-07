const { array } = require('i/lib/util');
const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    name:String,
    description:String,
    price:Number,
    discount:Number,
    status:String,
    quantity:Number,
    category:String,
    image:String,
    addedAt:{type:String,default:function(){
        return new Date().toDateString()
    }},
    subImage:{type:Array,default:[]},
    unlist:{type:Boolean,default:false}
    
})


const Products = mongoose.model('Products',productSchema);
module.exports = Products;