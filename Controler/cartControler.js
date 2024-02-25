const productCollection = require("../models/productModel");
const cartCollection = require("../models/cartModel");
const addressCollection = require("../models/addressModel");
const orderCollection = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const wishListCollection = require("../models/wishlistModel");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const paymentCollection = require("../models/paymentModel");
const couponCollection = require('../models/couponModel')
const razorpay = new Razorpay({
     key_id: "rzp_test_REpsQUqylPJZxt",
     key_secret: "B73pT7m7mlLQTj1Zzlx6Gvx5",
});

const addToCart = asyncHandler(async (req, res) => {

     try {
          let product = await productCollection.findOne({_id:req.query.proId});//checking product quantity
          if(product.quantity<=0){
               
          }
          else{


          const userId = req.session.user._id;

          const proId = req.query.proId;

          const cart = await cartCollection.findOne({ user: userId });
          //if cart already exists
          if (cart) {
               const proExists = cart.products.findIndex((e) => e.item == proId);
               if (proExists != -1) {
                    await cartCollection.updateOne({ user: userId, "products.item": proId }, { $inc: { "products.$.count": 1 } });
                    //decrementing quantity
                    await productCollection.updateOne({_id:req.query.proId},{$inc:{quantity:-1}})
               } else {
                    await cartCollection.updateOne(
                         { user: userId, user: userId },
                         { $push: { products: { item: proId, count: 1 } } }
                    );
                    //decrementing quantity
                    await productCollection.updateOne({_id:req.query.proId},{$inc:{quantity:-1}})
               }
          }

          //if cart doesnt exists
          else {
               const cartObj = {
                    user: userId,
                    products: [{ item: proId, count: 1 }],
               };

               await cartCollection.create(cartObj);
          }

          ///cartcount
          let cartCount = await cartCollection.findOne({ user: userId });
     
          res.json({ count: cartCount.products.length
               //  ,totalProducts:proCount
               });}
     } catch (error) {
          console.log(error.message);
       
          var err = new Error();
          error.statusCode = 400;
          next(err)
     }
});



//cart view page-------------------------------------------------------------

const cartControler = asyncHandler(async (req, res) => {
 
   
     try {
          const cartCount = await cartCollection.findOne({user:req.session.user._id});

          if(cartCount){

          
          var cart;
      
          
          //checking cart is empty or not 
          
          if(cartCount.products.length<=0||!cartCount){
             res.render("cart/cart-empty")
          }
          else{
               
          
          const cartDetails = await cartCollection.aggregate([
               { $match: { user: req.session.user._id } },
               { $unwind: "$products" },
               {
                    $project: {
                         item: "$products.item",
                         count: "$products.count",
                    },
               },
               {
                    $lookup: {
                         from: "products",
                         let: { item: { $toObjectId: "$item" } },
                         pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
                         as: "cartData",
                    },
               },
               {
                    $project: {
                         item: "$item",
                         count: "$count",
                         product: { $arrayElemAt: ["$cartData", 0] },
                    },
               },
               {
                    $project: {
                         item: 1,
                         count: 1,
                         product: 1,
                         total: { $multiply: ["$count", "$product.price"] },
                    },
               },
          ]);
          
          if(req.session.singleProduct){ 
            cart=cartDetails.filter((e)=>{ 
               return e.item==req.session.singleProduct; 
            })
          }
          else{ 
             cart = cartDetails
          }
         
          res.render("cart/cart", { home: true, cart });}}
          else{
               res.render("cart/cart-empty")
          }
          
     } catch (error) {
         
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)    
               
          
     }
});

//delete cart item-------------------------------------------------------------------
const deleteCartItem = asyncHandler(async (req, res) => {
     try{
     var cartCount= await cartCollection.findOne({user:req.session.user._id});
     

     //check if is the cartcount is zero if the cart count is zero we dont want the cart need to delete the whole cart;
     if (cartCount.products.length == 1){
          var cartObj = await cartCollection.findOne({user:req.session.user._id});

          let product =  cartObj.products.filter((e)=>{
               return e.item ==  req.params.id;
          })
     
     
          await productCollection.updateOne({_id:product[0].item},{$inc:{quantity:product[0].count}})
        
          await cartCollection.deleteOne({user:req.session.user._id});
          res.redirect("/cart/view-cart");
     }
     else{

     
     
     
     var cartObj = await cartCollection.findOne({user:req.session.user._id});

     let product =  cartObj.products.filter((e)=>{
          return e.item ==  req.params.id;
     })


     await productCollection.updateOne({_id:product[0].item},{$inc:{quantity:product[0].count}})
   
  
          let user = await cartCollection.updateOne(
               { user: req.session.user._id },
               {
                    $pull: { products: { item: req.params.id } },
               }
          );

          res.redirect("/cart/view-cart");
          const userId = req.session.user._id;
          const proId = req.query.id;}
}
      catch (error) {
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)      
       
     }
})

//change quantity--------------------------------------------------------------------

const changeQuantity = asyncHandler(async (req, res) => {
     try {
          let userId = req.session.user;
          let proId = req.query.proId;
          let count = parseInt(req.query.count);

          //updataing cart count
          const cart = await cartCollection.updateOne(
               { user: userId, "products.item": proId },
               { $inc: { "products.$.count": count } }
          );

          var inc
       
          if(count==1){
               inc=-1;
          }
          else{
               inc=1;
          }
          await productCollection.updateOne({_id:proId},{$inc:{quantity:inc}})

          ///fetching subtotal of a specific product
          const subtotal = await cartCollection.aggregate([
               { $match: { user: req.session.user._id } },
               { $unwind: "$products" },
               { 
                    $project: {
                         item: "$products.item",
                         count: "$products.count",
                    },
               },
               {
                    $lookup: {
                         from: "products",
                         let: { item: { $toObjectId: "$item" } },
                         pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
                         as: "cartData",
                    },
               },
               {
                    $project: {
                         item: "$item",
                         count: "$count",
                         product: { $arrayElemAt: ["$cartData", 0] },
                    },
               },
               {
                    $project: {
                         item: 1,
                         count: 1,
                         product: 1,
                         total: { $multiply: ["$count", "$product.price"] },
                    },
               },
               {
                    $match: { item: proId },
               },
               {
                    $project: { total: "$total" },
               },
          ]);

          res.json({ success: true, total: subtotal[0].total });
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
});

//cart count-----------------------------------------------------------------------

const cartCount = asyncHandler(async (req, res) => {
     try {
         
          //fechting count of products
          const cart = await cartCollection.findOne({ user: req.session.user._id });
   
          var cartCount;
          if (cart.products) {
               cartCount = cart.products.length;
          } else {
               cartCount = "";
          }
          //fetching wishlist count

          //fetching total price of product without discount

          let cartDatas = await cartCollection.aggregate([
               { $match: { user: req.session.user._id } },
               { $unwind: "$products" },

               { 
                    $project: {
                         item: "$products.item",
                         count: "$products.count",
                    },
               },
               {
                    $lookup: {
                         from: "products",
                         let: { item: { $toObjectId: "$item" } },
                         pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
                         as: "product",
                    },
               },
               {
                    $project: {
                         item: 1,
                         count: 1,
                         product: { $arrayElemAt: ["$product", 0] },
                    },
               },
               {
                    $group: {
                         _id: null,
                         total: { $sum: { $multiply: ["$count", "$product.price"] } },
                         discount: { $sum: { $multiply: ["$count", "$product.totalDiscount"] } },
                    },
               },
          ]);
          //total discount and subtotal and total amount that subtotal - discount
          var discount;

          if (cartDatas[0].discount) {
               discount = cartDatas[0].discount;
          } else {
               discount = "";
          }
          const subTotal = cartDatas[0].total;
          const totalPrice = subTotal - discount;

          res.json({ count: cartCount, discount: discount, subTotal: subTotal, totalPrice: totalPrice });
     }
     catch(error){
    
         console.log(error.message);
         var err = new Error();
         error.statusCode = 400;
         next(err)
          
     }
});

//checkout page----------------------------------------------------------------------

const  checkoutControler = asyncHandler(async (req, res) => {
     
     try {
          if (req.session.addresstype == null) {
               req.session.addresstype = "home";
          }
            //finding cart details
            var cart;
          const cartDetails = await cartCollection.aggregate([
               { $match: { user: req.session.user._id } },
               { $unwind: "$products" },
               {
                    $project: {
                         item: "$products.item",
                         count: "$products.count",
                    },
               },
               {
                    $lookup: {
                         from: "products",
                         let: { item: { $toObjectId: "$item" } },
                         pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
                         as: "cartData",
                    },
               },
               {
                    $project: {
                         item: "$item",
                         count: "$count",
                         product: { $arrayElemAt: ["$cartData", 0] },
                    },
               },
               {
                    $project: {
                         item: 1,
                         count: 1,
                         product: 1,
                         total: { $multiply: ["$count", "$product.price"] },
                    },
               },
          ]);

          if(req.session.singleProduct){
               cart = cartDetails.filter((e)=>{
                    return e.item == req.session.singleProduct
               })
          }
          else{
               cart=cartDetails
          }
          ///////////////////
          //finding address
          var add = await addressCollection.aggregate([
               { $match: { user: req.session.user._id, addresstype: req.session.addresstype } },
          ]);
          
          var address = add[0];
          var noAddress = false;
          if(address==undefined){
               noAddress=true
          }
          else{
               false;
          }
       
          
////////////////////////////////
           //finding total amount for coupon

           let cartDatas = await cartCollection.aggregate([
               { $match: { user: req.session.user._id } },
               { $unwind: "$products" },

               {
                    $project: {
                         item: "$products.item",
                         count: "$products.count",
                    },
               },
               {
                    $lookup: {
                         from: "products",
                         let: { item: { $toObjectId: "$item" } },
                         pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
                         as: "product",
                    },
               },
               {
                    $project: {
                         item: 1,
                         count: 1,
                         product: { $arrayElemAt: ["$product", 0] },
                    },
               },
               {
                    $group: {
                         _id: null,
                         total: { $sum: { $multiply: ["$count", "$product.price"] } },
                         discount: { $sum: { $multiply: ["$count", "$product.totalDiscount"] } },
                    },
               },
          ]);
          var total = cartDatas[0].total-cartDatas[0].discount
         
          //finding coupons

          const coupon = await couponCollection.aggregate([{$match:{minimumpurchase:{$lt:total},isActive:true}},{$match:{
               'users':{$not:{$elemMatch:{$eq:req.session.user._id}}}
          }}])
          console.log('coupon',coupon)
    
     
          
          

     
          const userId = req.session.user._id;
         
          //////////////////////////////
          res.render("cart/checkout", { home: true, cart, address,coupon ,userId,noAddress});
         
     } 
     catch(error){
          console.log(error.message)
       
          var err = new Error();
          error.statusCode = 500;
          next(err)
          
     }
});

//checkout post controler--------------------------------------------------------------------

const checkoutPostControler = asyncHandler(async (req, res) => {
     req.body.deliverycharge = parseInt(req.body.deliverycharge)
     req.body.subtotal=parseInt(req.body.subtotal);
     req.body.referaldiscount=parseInt(req.body.referaldiscount)
     req.body.discount=parseInt(req.body.discount);
     req.body.total = parseInt(req.body.total)
     console.log(req.body)
     try{

   
     if(req.body.save=='true'){
          const addr = {
               user:req.session.user._id,
               firstname:req.body.firstname,
               lastname:req.body.lastname,
               address:req.body.address,
               country:req.body.country,
               state:req.body.state,
               email:req.body.email,
               city:req.body.city,
               zipcode:req.body.zipcode,
               phonenumber:req.body.phonenumber,
               addresstype:'home'
          
          }
  
         
          await addressCollection.create(addr);
     }
     else{
          console.log('save not true')
     }
     const product = await cartCollection.findOne({ user: req.session.user });
     const productCount = product.products.length;
     var cart;
     const cartDetails = await cartCollection.aggregate([
          { $match: { user: req.session.user._id } },
          { $unwind: "$products" },
          {
               $project: {
                    item: "$products.item",
                    count: "$products.count",
               },
          },
          {
               $lookup: {
                    from: "products",
                    let: { item: { $toObjectId: "$item" } },
                    pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$item"] } } }],
                    as: "cartData",
               },
          },
          {
               $project: {
                    item: "$item",
                    count: "$count",
                    product: { $arrayElemAt: ["$cartData", 0] },
               },
          },
          {
               $project: {
                    item: 1,
                    count: 1,
                    product: 1,
                    total: { $multiply: ["$count", "$product.price"] },
               },
          },
     ]);

     if(req.session.singleProduct){
          cart = cartDetails.filter((e)=>{
               return e.item==req.session.singleProduct
          })
     }
     else{
          cart = cartDetails;
     }
     //--------------------------------------------------------------------------

     /// IF PAYMENT METHOD IS COD
     if (req.body.payment == "COD") {
          req.body.discount = parseInt(req.body.discount)
        
          const orderObj = {
               user: req.session.user._id,
               address: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    address: req.body.address,
                    email: req.body.email,
                    phonenumber: req.body.number,
                    country: req.body.country,
                    state: req.body.state,
                    zipcode: req.body.zipcode,
               },
               payment: req.body.payment,
               total: req.body.total,
               subtotal: req.body.subtotal,
               discount: req.body.discount,
               referalCode:req.body.referal,
               referalDiscount:req.body.referaldiscount,
               couponId: "",
               deliveryCharge:req.body.deliverycharge,
               
               products: cart,
               productsCount: product.products.length,
               couponCode:req.body.couponcode,
               coupon:req.body.coupon
          };

          await orderCollection.create(orderObj);
          const orderObject = await orderCollection.findOne(orderObj);
          //payment object to store in payment collections
          req.session.orderId=orderObject._id;
          const paymentObj = {
               order: '',
               type: "COD",
               orderDetails:orderObject._id ,
          };
          //saving payment details to payment collection

          await paymentCollection.create(paymentObj);
          if(req.session.singleProduct){
               let user = await cartCollection.updateOne(
                    { user: req.session.user },
                    {
                         $pull: { products: { item: req.session.singleProduct } },
                    }
               );
               req.session.singleProduct=null;
          }
          else{
               await cartCollection.deleteOne({ user: req.session.user._id });

          }
          res.redirect("/cart/order-success");
     }
//----------------------------------------------------------------------------------
     //PAYMENT IS RAZORPAY
     else  {
          const orderObj = {
               user: req.session.user._id,
               address: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    address: req.body.address,
                    email: req.body.email,
                    phonenumber: req.body.number,
                    country: req.body.country,
                    state: req.body.state,
                    zipcode: req.body.zipcode,
               },
              
               payment: req.body.payment,
               total: req.body.total,
               subtotal: req.body.subtotal,
               discount: req.body.discount,
               referalCode:req.body.referal,
               referalDiscount:req.body.referaldiscount,
               couponId: "",
               deliveryCharge:req.body.deliverycharge,
               
               products: cart,
               productsCount: product.products.length,
               couponCode:req.body.couponcode,
               coupon:req.body.coupon
          };
          await orderCollection.create(orderObj);
          const orderData = await orderCollection.findOne(orderObj).lean();
          

          await cartCollection.deleteOne({ user: req.session.user._id });

          await razorpay.orders
               .create({
                    amount: req.body.total*100,
                    currency: "INR",
                    receipt: orderData._id,
                    partial_payment: false,
                    notes: {
                         key1: "value3",
                         key2: "value2",
                    },
               })
               .then((order, error) => {
                    if (order) {
                         
                         console.log("its here");
                         req.session.orderId = orderData._id;
                         req.session.razorpayOrder = order;
                         res.render("cart/razorpay", { order, orderData });
                    } else {
                         console.log(error);
                    }
               });
     }}
     catch(error){
          console.log(error.message);
       
     }
});

//checkout change addresss---------------------------------------------------------------------

const checkoutChangeAddress = asyncHandler(async (req, res) => {
     try{

          req.session.addresstype = req.query.type;
          res.json({ success: true });
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
});

//razorpay-----------------------------------------------------------------------------

const razorPayControler = asyncHandler(async (req, res) => {
     try{

     console.log(process.env.RAZORPAY_KEY_SECRET)
     //crating signature using crypto library
     var crypto = require("crypto");
     var razorpaySecret =`${process.env.RAZORPAY_KEY_SECRET}`
     var hmac = crypto.createHmac("sha256", razorpaySecret);
     hmac.update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id);
     hmac = hmac.digest("hex");
     //checking created signature and razorpay given signature are the same
     if (hmac == req.body.razorpay_signature) {
          console.log("payment successful");
          //payment object to store in payment collections
          const paymentObj = {
               order: req.session.razorpayOrder,
               type: "Online",
               orderDetails: req.session.orderId,
          };
          //saving payment details to payment collection

          await paymentCollection.create(paymentObj);
          res.redirect("/cart/order-success")
     } else {
          console.log("payment not successfull");
          await orderCollection.deleteOne({ _id: req.session.orderId });
          res.send("payment Failed");
     }
}
catch(error){
     console.log(error.message);
     var err = new Error();
     error.statusCode = 400;
     next(err)
     
}
});

//order success---------------------------------------------------------------------

const OrderSuccess = asyncHandler(async(req,res)=>{
     try{

          let data =  await orderCollection.findOne({_id:req.session.orderId});
          const totalAmout = data.total;
          let coupon = await couponCollection.find({}).lean()
          console.log(data.total)
           res.render("cart/order-success")
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
  
})

//out of stock checkng

const outOfStock = asyncHandler(async(req,res)=>{
     // await productCollection.updateMany({quanity:0},{$set:{
     //      status:'Out Of Stock'
     // }})
})

const addressExistsControler = asyncHandler(async(req,res)=>{
     try{

          const address = await addressCollection.findOne({user:req.query.id});
          if(address){
               res.json({address:true})
          }
          else{
               res.json({address:false})
          }
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err)
     }
})

//singleProduct purchase controler----------------------------------------------------------------

const singleProduct = asyncHandler(async(req,res)=>{
 try {
        const userId = req.session.user._id;

        const proId = req.query.proId;
        req.session.singleProduct=req.query.proId;

        const cart = await cartCollection.findOne({ user: userId });
        //if cart already exists
        if (cart) {
             const proExists = cart.products.findIndex((e) => e.item == proId);
             if (proExists != -1) {
                  await cartCollection.updateOne({ user: userId, "products.item": proId }, { $inc: { "products.$.count": 1 } });
             } else {
                  await cartCollection.updateOne(
                       { user: userId, user: userId },
                       { $push: { products: { item: proId, count: 1 } } }
                  );
             }
        }

        //if cart doesnt exists
        else {
             const cartObj = {
                  user: userId,
                  products: [{ item: proId, count: 1 }],
             };

             await cartCollection.create(cartObj);
        }

        ///cartcount
        let cartCount = await cartCollection.findOne({ user: userId });
        
        res.redirect("/cart/view-cart")
   } catch (error) {
     console.log(error.message);
     var err = new Error();
     error.statusCode = 500;
     next(err)
   }
})
module.exports = {
     addToCart,
     cartControler,
     deleteCartItem,
     changeQuantity,
     cartCount,
     checkoutControler,
     checkoutPostControler,
     checkoutChangeAddress,
     razorPayControler,
     OrderSuccess,
     outOfStock,
     addressExistsControler,
     singleProduct
};
