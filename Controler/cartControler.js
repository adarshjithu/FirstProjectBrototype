const productCollection = require("../models/productModel");
const cartCollection = require("../models/cartModel");
const asyncHandler = require("express-async-handler");

const addToCart = asyncHandler(async (req, res) => {
     try{
          const userId = req.session.user._id;

          const proId = req.query.proId;
     
          const cart = await cartCollection.findOne({ user: userId });
          //if cart already exists
          if (cart) {
               const proExists = cart.products.findIndex((e) => e.item == proId);
               if (proExists != -1) {
                    await cartCollection.updateOne({ user: userId, "products.item": proId }, { $inc: { "products.$.count": 1 } });
               } else {
                    await cartCollection.updateOne({ user: userId, user: userId }, { $push: { products: { item: proId, count: 1 } } });
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
          res.json({ count: cartCount.products.length });
     }
     catch(error){
          throw new Error(error.message)
     }
     
});

//cart view page

const cartControler = asyncHandler(async (req, res) => {
     try{
          const cart = await cartCollection.aggregate([
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
     
          res.render("cart/cart", { home: true, cart });
     }
     catch(error){
          throw new Error(error.message)
     }
     
});

//delete cart item
const deleteCartItem = asyncHandler(async (req, res) => {
     try{

          let user = await cartCollection.updateOne(
               { user: req.session.user },
               {
                    $pull: { products: { item: req.params.id } },
               }
          );
     
          res.redirect("/cart/view-cart");
          const userId = req.session.user._id;
          const proId = req.query.id;
     }
     catch(error){
          throw new Error(error.message)
     }
});

//change quantity

const changeQuantity = asyncHandler(async (req, res) => {
     try{

          let userId = req.session.user;
          let proId = req.query.proId;
          let count = parseInt(req.query.count);
     
          //updataing cart count
          const cart = await cartCollection.updateOne(
               { user: userId, "products.item": proId },
               { $inc: { "products.$.count": count } }
          );
     
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
          throw new Error(error.message)
     }
});

///cart count

const cartCount = asyncHandler(async (req, res) => {
     try{
          //fecting count of products
     const cart = await cartCollection.find({ user: req.session.user._id });
     const cartCount = cart[0].products.length;
    

     //fetching total price of product without discount

     let cartDatas = await cartCollection.aggregate([{ $match: { user: req.session.user._id } }, { $unwind: "$products" },
     
     
     {
           $project:{
               item:'$products.item',
               count:'$products.count'
           }
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
          $project:{
               item:1,
               count:1,
                product: { $arrayElemAt: ["$product", 0] },
          }
     },
     {
          $group:{
               _id:null,
               total:{$sum:{$multiply:['$count','$product.price']}},
               discount:{$sum:{$multiply:['$count','$product.discount']}}

          }
     }
]);
//total discount and subtotal and total amount that subtotal - discount
const discount = cartDatas[0].discount;
const subTotal = cartDatas[0].total;
const totalPrice = subTotal-discount;

res.json({ count: cartCount,discount:discount,subTotal:subTotal,totalPrice:totalPrice });

     }
     catch(error){
          throw new Error(error.message)
     }
});


//checkout page

const checkoutControler = asyncHandler(async(req,res)=>{
     try{  req.session.addresstype='home'

          const cart = await cartCollection.aggregate([
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
        
          res.render("cart/checkout",{home:true,cart})
     }
     catch(error){
          throw new Error(error.message)
     }
})

//checkout post controler

const checkoutPostControler = asyncHandler(async(req,res)=>{
     console.log(req.body);
})



module.exports = { addToCart, cartControler, deleteCartItem, changeQuantity, cartCount ,checkoutControler
,checkoutPostControler};
