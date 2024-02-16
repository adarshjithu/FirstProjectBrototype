const asyncHandler = require("express-async-handler");
const userCollection = require("../models/userModel");
const productCollection = require("../models/productModel");
const orderCollection = require("../models/orderModel");
const walletCollection = require("../models/walletModel")
var objectid = require('objectid')
const fs = require('fs');
const path = require('path');
//admin view order--------------------------------------------------------------------------

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

//delete order--------------------------------------------------------------------------------

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

//user order details------------------------------------------------------------------

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

//user order cancelllation-------------------------------------------------------------

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

//admin edit order-----------------------------------------------------------------------

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

//changeOrderStatsus-----------------------------------------------------------------------------

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

//user order cancel select payment---------------------------------------------------------

const userOrderCancelSelectPayment = asyncHandler(async (req, res) => {
     try{

          console.log(req.query.id,'orderId',)
     
          const order = await orderCollection.findOne({_id:req.query.id}).lean()
          console.log('order',order)
         //order is cash on delivery
           if(order.payment=='COD'){
               res.render('order/order-cancelled')
               await orderCollection.findByIdAndUpdate({_id:req.query.id},{
                    status:'Cancelled'
                  
                   })
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
///order cancel confirm------------------------------------------------------------------------

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


//order return reason-----------------------------------------------------------------------------------

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

///order return type selection page----------------------------------------------------------

const orderReturnTypeSelection = asyncHandler(async(req,res)=>{
     try{

          const orders = await orderCollection.findOne({_id:req.query.id}).lean()
          
          res.render("order/return-type",{orders})
     }
     catch(error){
          console.log(error.message)
     }
})

//user order return type----------------------------------------------------------------------

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
     
})

//invoice----------------------------------------------------------------------------

const orderInvoiceControler = asyncHandler(async(req,res)=>{

var easyinvoice = require('easyinvoice');


var data = {
     apiKey: "free", // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
     mode: "development", // Production or development, defaults to production   
    
     // Your own data
     sender: {
         company: "Sample Corp",
         address: "Sample Street 123",
         zip: "1234 AB",
         city: "Sampletown",
         country: "Samplecountry"
         // custom1: "custom value 1",
         // custom2: "custom value 2",
         // custom3: "custom value 3"
     },
     // Your recipient
     client: {
         company: "Client Corp",
         address: "Clientstreet 456",
         zip: "4567 CD",
         city: "Clientcity",
         country: "Clientcountry"
         // custom1: "custom value 1",
         // custom2: "custom value 2",
         // custom3: "custom value 3"
     },
     information: {
         // Invoice number
         number: "2021.0001",
         // Invoice data
         date: "12-12-2021",
         // Invoice due date
         dueDate: "31-12-2021"
     },
     // The products you would like to see on your invoice
     // Total values are being calculated automatically
     products: [
         {
             quantity: 2,
             description: "Product 1",
             taxRate: 6,
             price: 33.87
         },
         {
             quantity: 4.1,
             description: "Product 2",
             taxRate: 6,
             price: 12.34
         },
         {
             quantity: 4.5678,
             description: "Product 3",
             taxRate: 21,
             price: 6324.453456
         }
     ],
     // The message you would like to display on the bottom of your invoice
     bottomNotice: "Kindly pay your invoice within 15 days.",
     // Settings to customize your invoice
     settings: {
         currency: "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
         // locale: "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
         // marginTop: 25, // Defaults to '25'
         // marginRight: 25, // Defaults to '25'
         // marginLeft: 25, // Defaults to '25'
         // marginBottom: 25, // Defaults to '25'
         // format: "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
         // height: "1000px", // allowed units: mm, cm, in, px
         // width: "500px", // allowed units: mm, cm, in, px
         // orientation: "landscape" // portrait or landscape, defaults to portrait
     },
     // Translate your invoice to your preferred language
     translate: {
         // invoice: "FACTUUR",  // Default to 'INVOICE'
         // number: "Nummer", // Defaults to 'Number'
         // date: "Datum", // Default to 'Date'
         // dueDate: "Verloopdatum", // Defaults to 'Due Date'
         // subtotal: "Subtotaal", // Defaults to 'Subtotal'
         // products: "Producten", // Defaults to 'Products'
         // quantity: "Aantal", // Default to 'Quantity'
         // price: "Prijs", // Defaults to 'Price'
         // productTotal: "Totaal", // Defaults to 'Total'
         // total: "Totaal", // Defaults to 'Total'
         // taxNotation: "btw" // Defaults to 'vat'
     },
 
     // Customize enables you to provide your own templates
     // Please review the documentation for instructions and examples
     // "customize": {
     //      "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
     // }
 };
 
 //Create your invoice! Easy!

     //The response will contain a base64 encoded PDF file
     easyinvoice.createInvoice(data, function (result) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=${Date.now()}invoice.pdf`);
          res.send(Buffer.from(result.pdf, 'base64'));
});

 
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
     userOrderReturnTypepost,
     orderInvoiceControler
};
