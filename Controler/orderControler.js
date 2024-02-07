const asyncHandler = require("express-async-handler");
const userCollection = require("../models/userModel");
const productCollection = require("../models/productModel");
const orderCollection = require("../models/orderModel");
const walletCollection = require("../models/walletModel")
var objectid = require('objectid')
//admin view order

const adminViewOrder = asyncHandler(async (req, res) => {
     try{
          
     
     
     var order = await orderCollection.find({}).lean()
     var orders = order
   
     
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

     res.render("order/admin-view-order", { orders, });
     console.log(orders[0].products)
     }
     catch(error){
        
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});

//delete order

const adminDeleteOrder = asyncHandler(async (req, res) => {
     try{

          await orderCollection.findByIdAndDelete({ _id: req.query.id });
          res.redirect("/order/admin-view-orders");
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err)
     }
});

const userOrderHistory = asyncHandler(async (req, res) => {
     try{

          const orders = await orderCollection.aggregate([{ $match: { user: req.session.user._id } }, { $sort: { _id: -1 } }]);
     
          res.render("order/user-order-history", { home: true, orders });
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});

//user order details

const userOrderDetails = asyncHandler(async (req, res) => {
     try {
          var delivered = false;
          var cancelled = false;
          const orderData = await orderCollection.findOne({ _id: req.query.id }).lean();
          if (orderData.status == "Delivered") {
               delivered = true;
          }
          if (orderData.status == "Cancelled") {
               cancelled = true;
          }

          res.render("order/user-order-details", { home: true, orderData, delivered, cancelled });
     } catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});

//user order cancelllation

const userOrderCancel = asyncHandler(async (req, res) => {
     res.render("order/user-order-cancel", { home: true, orderId: req.query.id });
});

//order confirm

const userOrderConfirm = asyncHandler(async (req, res) => {
     try{

          const order = await orderCollection.findOneAndUpdate({ _id: req.query.id }, { status: "Cancelled" });
          res.redirect("/order/order-history");
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err)
     }
});

//admin edit order

const adminEditOrder = asyncHandler(async (req, res) => {
     try{

          const orderData = await orderCollection.findOne({ _id: req.query.id }).lean();
          console.log(orderData);
          res.render("order/admin-edit-order", { orderData });
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});

//changeOrderStatsus

const changeOrderStatus = asyncHandler(async (req, res) => {
     try{

          console.log(req.query.id, req.query.status);
          await orderCollection.findOneAndUpdate({ _id: req.query.id }, { status: req.query.status });
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});

//user order cancel select payment

const userOrderCancelSelectPayment = asyncHandler(async (req, res) => {
     try{

          console.log(req.query.id,'orderId',)
     
          const order = await orderCollection.findOne({_id:req.query.id}).lean()
          console.log('order',order)
         //order is cash on delivery
           if(order.payment=='COD'){
               res.render('order/order-cancelled')
           }
           
           //order is online payment
           else{
                
               // var orderDetails = order.products[0].product
               // orderDetails.orderId= order._id
               // orderDetails.total=order.total;
               // orderDetails.count=order.products[0].count
               
             
          
               res.render("order/user-order-cancel-selectpayment", { home: true,order });
           }
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});
///order cancel confirm

const cancelConfirmControler = asyncHandler(async(req,res)=>{
     try{

          let transactionId ='#'+Math.floor(Math.random()*100000000);
          let date = new Date().toDateString()
          var amount = parseInt(req.query.id)
          
       
         if(req.body.money=='giftCardWallet'){
             const walletFind = await walletCollection.findOne({user:req.session.user._id});
     
            //wallet find
             if(walletFind){
                    const walletAmount = walletFind.amount+amount
                   
                    //incrementing wallet amount
                    await walletCollection.updateOne({user:req.session.user._id},{$set:{amount:walletAmount}});
                    //pushing wallet transction
                
                    await walletCollection.updateOne({user:req.session.user._id},{$push:{transactions:{
                         transactionId:transactionId,
                         date:date,
                         description:'Order Cancel',
                         amount:amount,
                         
     
                     
     
                    }}})
                    //changing order status
                    await orderCollection.findByIdAndUpdate({_id:req.query.orderId},{
                     status:'Cancelled'
                   
                    })
     
                    res.render('order/order-cancelled')
             }
             else{
          
                 const walletObj = {
                     user:req.session.user._id,
                     amount:amount,
                     transactions:[{
                         transactionId:transactionId,
                         date:date,
                         description:'Order Cancel',
                         amount:amount,
                         
     
                     }
     
                     ]
                 }
                 await walletCollection.create(walletObj)
                 res.render('order/order-cancelled')
             }
         }
     }
     catch(error){
          
          var err = new Error();
          error.statusCode = 400;
          next(err) 
     }
    

})


//order return reason

const orderReturnReasonControler =asyncHandler(async(req,res)=>{
     try{

          const orderId = req.query.id
          res.render("order/order-return-reason",{orderId})
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }

})

///order return type selection page

const orderReturnTypeSelection = asyncHandler(async(req,res)=>{
     try{

          const orders = await orderCollection.findOne({_id:req.query.id}).lean()
          
          res.render("order/return-type",{orders})
     }
     catch(error){
          console.log(error.message)
     }
})

//user order return type

const userOrderReturnTypepost=asyncHandler(async(req,res)=>{
     try{

          let transactionId ='#'+Math.floor(Math.random()*100000000);
          let date = new Date().toDateString()
          var amount = parseInt(req.query.id)
          
       
         if(req.body.money=='giftCardWallet'){
             const walletFind = await walletCollection.findOne({user:req.session.user._id});
     
            //wallet find
             if(walletFind){
                    const walletAmount = walletFind.amount+amount
                   
                    //incrementing wallet amount
                    await walletCollection.updateOne({user:req.session.user._id},{$set:{amount:walletAmount}});
                    //pushing wallet transction
                
                    await walletCollection.updateOne({user:req.session.user._id},{$push:{transactions:{
                         transactionId:transactionId,
                         date:date,
                         description:'Order Returned',
                         amount:amount,
                         
     
                     
     
                    }}})
                    //changing order status
                    await orderCollection.findByIdAndUpdate({_id:req.query.orderId},{
                     status:'Returned'
                   
                    })
     
                    res.render('order/order-cancelled')
             }
             else{
          
                 const walletObj = {
                     user:req.session.user._id,
                     amount:amount,
                     transactions:[{
                         transactionId:transactionId,
                         date:date,
                         description:'Order Returned',
                         amount:amount,
                         
     
                     }
     
                     ]
                 }
                 await walletCollection.create(walletObj)
                 res.render('order/order-cancelled')
             }
         }
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
     
     
     // if(req.body.money=='giftCardWallet'){
     //      const walletFind = await walletCollection.findOne({user:req.session.user._id});
  
  
     //      if(walletFind){
     //             const walletAmount =parseInt( walletFind.amount)+parseInt(req.query.id)
                
                 
     //             await walletCollection.updateOne({user:req.session.user._id},{$set:{amount:walletAmount}})
     //             await orderCollection.findByIdAndUpdate({_id:req.query.orderId},{
     //              status:'Returned'
                
     //             })
     //             res.render('order/order-cancelled')
     //      }
     //      else{
  
     //           let transactionId = Math.floor(Math.random()*10);
     //     let date = new Date().toDateString()
     //        const walletObj = {
     //            user:req.session.user._id,
     //            amount:amount,
     //            transactions:[{
     //                transactionId:transactionId,
     //                date:date,
     //                description:'Order Returned',
     //                amount:amount,
                    

     //            }

     //            ]
     //        }
     //          await walletCollection.create(walletObj);
     //          res.render('order/order-cancelled')
     //      }
     //  }

})
module.exports = {
     adminViewOrder,
     adminDeleteOrder,
     userOrderHistory,
     userOrderDetails,
     userOrderCancel,
     userOrderConfirm,
     adminEditOrder,
     changeOrderStatus,
     userOrderCancelSelectPayment,
     cancelConfirmControler,
     orderReturnReasonControler,
     orderReturnTypeSelection,
     userOrderReturnTypepost
};
