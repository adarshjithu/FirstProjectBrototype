const cartCollection = require("../models/cartModel");
const asyncHandler = require("express-async-handler");
const productCollection = require("../models/productModel");
const productsearchControler = asyncHandler(async (req, res) => {
     try{

          // const proDetails = await productCollection.find({category:{$regex:req.body.search,$options:'i'}})
          // console.log(proDetails)
          req.session.search = req.body.search;
          res.redirect("/user_products");
     }
     catch(error){
          throw new Error(error.message)
     }
});

//product category
const productCategory = asyncHandler(async (req, res) => {
     try{

          req.session.search = req.query.id;
          res.redirect("/user_products");
     }
     catch(error){
          throw new Error(error.message)
     }
});

//all products
const allProducts = (req, res) => {
     try{

          req.session.search = null;
          res.redirect("/user_products");
     }
     catch(error){
          throw new Error(error.message)

     }
};

const subImageControler = asyncHandler(async (req, res) => {
     try{

          const SubImagesArray = req.files.map((e) => {
               return e.filename;
          });
     
          const data = await productCollection.updateOne(
               { _id: req.query.id },
               { $push: { subImage: { $each: [...SubImagesArray] } } }
          );
     
          const array = req.files;
     }
     catch(error){
          throw new Error(error.message)

     }
});

//add sub image

const addSubImage = asyncHandler(async (req, res) => {
     try{

          res.redirect("/");
     }
     catch(error){
          throw new Error(error.message)

     }
});

//cart



//addto cart


//delte cart 



module.exports = {
     productsearchControler,
     productCategory,
     allProducts,
     subImageControler,
     addSubImage,
  
  
     
};
