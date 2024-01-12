const asyncHandler = require("express-async-handler");
const userCollection = require("../models/userModel");
const productCollection = require('../models/productModel');
const orderCollection = require('../models/orderModel')

//admin view order

const adminViewOrder = asyncHandler(async (req, res) => {
    const orders = await orderCollection.aggregate([{$match:{}}])
//         ,{
//         $project:{address:0,couponId:0,subtotal:0,discount:0}
//     },
//     {$unwind:'$products'},
//     {
//         $project:{
//             _id:1,
//             user:1,
//             total:1,
//             item:'$products.item',
//             count:'$products.count',
//             status:1,
//             productsCount:1,
//             orderedAt:1,
//             payment:1

//         }
//     },
//     {  $lookup: {
//         from: "products",
//         let: { item: { $toObjectId: "$item" } },
//         pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
//         as: "product",
//    },},
//    {$project:{
//     _id:1,
//     user:1,
//     total:1,
//     item:{$arrayElemAt:['$product',0]},
//     count:'$products.count',
//     status:1,
//     productsCount:1,
//     orderedAt:1,
//     payment:1,
  
    

//    }},
//    {
//     $lookup:{
//         from:'users',
//         let:{user:{$toObjectId:"$user"}},
//         pipeline:[{$match:{$expr:{$eq:['$_id','$$user']}}}],
//         as:'user'
//     }
//    },{
//     $project:{
//         _id:1,
//         user:{$arrayElemAt:['$user',0]},
//         total:1,
//         productsCount:1,
//         orderedAt:1,
//         item:1,
//         payment:1,
//         status:1


//     }
//    }


// ]);


     res.render("order/admin-view-order",{orders});
 
});

//delete order

const adminDeleteOrder = asyncHandler(async(req,res)=>{

         await orderCollection.findByIdAndDelete({_id:req.query.id});
         res.redirect("/order/admin-view-orders")
})


const userOrderHistory =asyncHandler(async(req,res)=>{

   const orders = await orderCollection.aggregate([{$match:{user:req.session.user._id,status:{$ne:'Cancelled'}}}])
   
    res.render("order/user-order-history",{home:true,orders});
   
   
})

//user order details

const userOrderDetails = asyncHandler(async(req,res)=>{
    try{
        const  orderData = await orderCollection.findOne({_id:req.query.id}).lean() ;
    
        res.render("order/user-order-details",{home:true,orderData})
       

    }
    catch(error){
        throw new Error(error.message)
    } 
   
})

//user order cancelllation

const userOrderCancel= asyncHandler(async(req,res)=>{
   
    res.render("order/user-order-cancel",{home:true,orderId:req.query.id})

})


//order confirm

const userOrderConfirm = asyncHandler(async(req,res)=>{

   const order =  await orderCollection.findOneAndUpdate({_id:req.query.id},{status:'Cancelled'})
    res.redirect("/order/order-history")

})

//admin edit order

const adminEditOrder = asyncHandler(async(req,res)=>{
    const orderData = await orderCollection.findOne({_id:req.query.id}).lean()
   console.log(orderData)
    res.render("order/admin-edit-order",{orderData})
})

//changeOrderStatsus

const changeOrderStatus  = asyncHandler(async(req,res)=>{
    console.log(req.query.id,req.query.status)
    await orderCollection.findOneAndUpdate({_id:req.query.id},{status:req.query.status})
})

module.exports = { adminViewOrder,adminDeleteOrder,userOrderHistory ,userOrderDetails,userOrderCancel,userOrderConfirm,adminEditOrder
,changeOrderStatus};
