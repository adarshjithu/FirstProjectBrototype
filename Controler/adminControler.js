const { createAdmin } = require("../middlewares/middleware");
const asyncHandler = require("express-async-handler");
const UserCollection = require("../models/userModel");
const Admin = require("../models/adminModel");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel");
const orderCollection = require("../models/orderModel");
const offerCollection = require("../models/offerModel");
const bannerCollection = require("../models/bannerModel")

const adminHome = asyncHandler(async (req, res) => {
     try {
          var ADMIN;
          if (req.session.admin) {
          } else {
               ADMIN = null;
          }
          // createAdmin('adarsh','adarshjithu10@gmail.com','123');

          //totalSales
          const total = await orderCollection.aggregate([
               {
                    $group: {
                         _id: null,
                         total: { $sum: "$total" },
                         productCount: { $sum: "$productsCount" },
                    },
               },
          ]);
          //total sales productcount total revenue
          const totalSales = total[0].total;
          const productsCount = total[0].productCount;
          const totalRevenue = Math.floor((total[0].total * 30) / 100);
          //total users
          const users = await UserCollection.find({});
          const userCount = users.length;

          //total items sold

          const allOrders = await orderCollection.find({});
          let dt = new Date().toDateString();

          res.render("admin/home", { admin: req.session.admin.name, totalSales, productsCount, totalRevenue, userCount });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});
// ----------------------------------adminloginpage--------------------------------------------

const adminLogin = asyncHandler((req, res) => {
     try {
          if (req.session.admin) {
               res.redirect("/admin");
          } else {
               res.render("admin/login");
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// ----------------------------------adminLoginPost-------------------------------------

const adminLoginPost = asyncHandler(async (req, res) => {
     try {
          const admin = await Admin.findOne({ email: req.body.email });
          if (admin && (await admin.isPasswordMatched(req.body.password))) {
               req.session.admin = admin;

               req.session.admin.name = req.session.admin.name.charAt(0).toUpperCase() + req.session.admin.name.slice(1);
               res.redirect("/admin");
          } else {
               res.render("admin/login", { error: true });
          }
     } catch (error) {
          throw new Error(error.message);
     }
});

// ----------------------------adminlogout-----------------------------------------

const adminLogout = (req, res) => {
     req.session.admin = null;
     res.redirect("/admin");
};

// --------------------------------adminCustomers-------------------------------------

const adminCustomers = asyncHandler(async (req, res) => {
     try {
          const customers = await UserCollection.find().lean();

          res.render("admin/customers", { admin: req.session.admin.name, customers });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// ---------------------------------adminviewproducts--------------------------

const adminViewProducts = asyncHandler(async (req, res) => {
     try {
          await productCollection.updateMany(
               { quantity: 0 },
               {
                    $set: {
                         status: "Out Of Stock",
                    },
               }
          );
          await productCollection.updateMany(
               { quantity: { $gt: 0, $lt: 6 } },
               {
                    $set: {
                         status: "Low Of Stock",
                    },
               }
          );
          await productCollection.updateMany(
               { quantity: { $gt: 5 } },
               {
                    $set: {
                         status: "Published",
                    },
               }
          );

          const products = await productCollection.find({}).sort({ addedAt: -1 }).lean();
          const Products = products.map((e) => {
               if (e.status == "Published") {
                    e.isPublished = true;
               }
               if (e.status == "Out of stock") {
                    e.isOutOfStock = true;
               }
               if (e.status == "Low of stock") {
                    e.isLowOfStock = true;
               }
               if (e.status == "Published") {
                    e.isPublished = true;
               }
               if (e.status == "Draft") {
                    e.isDraft = true;
               }

               return e;
          });

          if (products) {
               res.render("admin/viewProducts", { admin: req.session.admin.name, Products });
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// -------------------------blockuser------------------------------------------

const adminBlockUser = asyncHandler(async (req, res) => {
     try {
          const data = await UserCollection.findOne({ _id: req.params.id });
          if (data.isActive) {
               let user = await UserCollection.findOneAndUpdate({ _id: req.params.id }, { isActive: false });
          } else {
               let user = await UserCollection.findOneAndUpdate({ _id: req.params.id }, { isActive: true });
          }
          res.redirect("/admin/customers");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});
// --------------------------------------admin view products--------------------------

const adminAddProduct = asyncHandler(async (req, res) => {
     try {
          const category = await categoryCollection.find({}).lean();
          const productoffer = await offerCollection.findOne({ productOffers: { $exists: true } });
          const offer = productoffer.productOffers;

          res.render("admin/add-product", { category, offer });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});
// -------------------------------------admin addproduct post-------------------------------
const adminAddProductPost = asyncHandler(async (req, res) => {
     console.log(req.body)
     //converting seasonal offer discount into Number from string
     req.body.offerDiscount = parseInt(req.body.offerDiscount);
     req.body.discount = parseInt(req.body.discount)
     req.body.price = parseInt(req.body.price);

       
     console.log(req.body)
     const seasonalDiscount = parseInt(req.body.price*req.body.offerDiscount/100)
     const normalDiscount  =parseInt( req.body.discount)
     const totalDiscount = seasonalDiscount + normalDiscount;
     const discountedPrice = req.body.price - totalDiscount;
    

     
     try {
          let filename;
          if (req.file.filename) {
               filename = req.file.filename;
          } else {
               filename = "";
          }
    

          const productsObj = {
               name: req.body.name,
               price: req.body.price,
               description: req.body.description,
               discount: req.body.discount,
               status: req.body.status,
               quantity: req.body.quantity,
               category: req.body.category,
               image: filename,
               offerDiscount: req.body.offerDiscount,
               offerType: req.body.offerType,
               discountedPrice: discountedPrice,
               totalDiscount: totalDiscount,
          };

          console.log(productsObj)

          let products = await productCollection.create(productsObj);
          if (products) {
               res.redirect("/admin/add-product");
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }

     
});

// ----------------------------------------admin delete product-------------------------------

const adminDeleteProduct = asyncHandler(async (req, res) => {
     try {
          console.log(req.params.id);
          await productCollection.findOneAndDelete({ _id: req.params.id });
          res.redirect("/admin/view_products");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// ----------------------------------------------view product category------------------------------

const adminViewProductCategoryVise = asyncHandler(async (req, res) => {
     try {
          if (req.query.id == "Listed") {
               const Products = await productCollection.find({ unlist: true }).lean();

               res.render("admin/viewProducts", { admin: req.session.admin, Products });
          } else if (req.query.id == "Unlisted") {
               const Products = await productCollection.find({ unlist: false }).lean();

               res.render("admin/viewProducts", { admin: req.session.admin, Products });
          } else {
               const Products = await productCollection.find({ status: req.query.id }).lean();

               res.render("admin/viewProducts", { admin: req.session.admin, Products });
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// -----------------------------------------------edit product----------------------------------
const adminEditProduct = asyncHandler(async (req, res) => {
     try {
          const category = await categoryCollection.find({}).lean();
          const products = await productCollection.findById({ _id: req.query.id }).lean();
          res.render("admin/edit-product", { products, category });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// ------------------------------------------edit product post-------------------------------------
const adminEditProductPost = asyncHandler(async (req, res) => {
     console.log(req.body, req.query.id);

     try {
          req.body.category = req.body.category[0];
          req.body.status = req.body.status[0];
          req.body.quantity = req.body.quantity[0];
          console.log(req.body);

          var convertDiscount = (parseInt(req.body.price) * parseInt(req.body.offerDiscount)) / 100 - parseInt(req.body.discount);
          var totalDiscount = Math.floor(convertDiscount);
          req.body.totalDiscount = totalDiscount;
          req.body.discountedPrice = parseInt(req.body.price) - totalDiscount;

          const products = await productCollection.findByIdAndUpdate({ _id: req.query.id }, req.body);
          res.redirect("/admin/view_products");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// --------------------------------------------change image------------------------------------

const changeImage = asyncHandler(async (req, res) => {
     try {
          let changeProduct = await productCollection.findByIdAndUpdate({ _id: req.query.id }, { image: req.file.filename });
          if (changeProduct) {
               res.redirect("/admin/view_products");
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// -------------------------------------------add category---------------------------

const adminAddCategory = asyncHandler(async (req, res) => {
     try {
          res.render("admin/add-category");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// -------------------------------------add category post----------------------------------
const adminAddCategoryPost = asyncHandler(async (req, res) => {
     try {
          const categoryObj = {
               image: req.file.filename,
               category: req.body.category,
               description: req.body.description,
          };
          const cat = await categoryCollection.findOne({ category: req.body.category });
          if (cat) {
               res.render("admin/add-category", { error: true });
          } else {
               const data = await categoryCollection.create(categoryObj);
               if (data) {
                    res.redirect("/admin/view-category");
               }
          }
     } catch (error) {
          console.log(error.message);
     }
});

// ----------------------------------------admin view category---------------------------
const adminViewCategory = asyncHandler(async (req, res) => {
     try {
          const data = await categoryCollection.aggregate([
               {
                    $lookup: {
                         from: "products",
                         localField: "category",
                         foreignField: "category",
                         as: "cat",
                    },
               },
               {
                    $addFields: {
                         stock: { $size: "$cat" },
                    },
               },
               { $sort: { addedAt: 1 } },
          ]);

          res.render("admin/view-category", { data });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// ------------------------------------------deletecategory-------------------------------

const deleteCategory = asyncHandler(async (req, res) => {
     try {
          await categoryCollection.findOneAndDelete({ _id: req.params.id });
          res.redirect("/admin/view-category");
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// -------------------------------------------------edit-category----------------------------

const editCategory = asyncHandler(async (req, res) => {
     try {
          const category = await categoryCollection.findById({ _id: req.query.id }).lean();

          res.render("admin/edit-category", { category });
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 400;
          next(err);
     }
});

// ----------------------------------------editCategory post--------------------------------------

const editCategoryPost = asyncHandler(async (req, res) => {
     try {
          console.log(req.body.category);
          const cat = await categoryCollection.findOne({ category: req.body.category });
          if (cat) {
               const category = await categoryCollection.findById({ _id: req.query.id }).lean();

               res.render("admin/edit-category", { category, error: true });
          } else {
               let updatedCategory = await categoryCollection.findOneAndUpdate({ _id: req.query.id }, req.body);
               if (updatedCategory) {
                    res.redirect("/admin/view-category");
               }
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});

// -------------------------------------edit-category image------------------------------------

const editCategoryImage = asyncHandler(async (req, res) => {
     try {
          const result = await categoryCollection.findOneAndUpdate({ _id: req.query.id }, { image: req.file.filename });
          if (result) {
               res.redirect("/admin/view-category");
          }
     } catch (error) {
          console.log(error.message);

          var err = new Error();
          error.statusCode = 500;
          next(err);
     }
});
// --------------------------------------cateogory chart----------------------------------

const categoryChartControler = asyncHandler(async (req, res) => {
     console.log("called");
     const orders = await orderCollection.find({});
     const products = orders.map((e) => {
          return e.products;
     });
     const category = [];
     products.forEach((e) => {
          e.forEach((ele) => {
               category.push(ele.product.category);
          });
     });

     var fr = category.map((e) => {
          return -1;
     });

     for (i = 0; i < category.length; i++) {
          let count = 1;
          for (j = i + 1; j < category.length; j++) {
               if (i != j) {
                    if (category[i] == category[j]) {
                         fr[j] = 0;
                         count++;
                    }
               }
          }

          if (fr[i] !== 0) {
               fr[i] = count;
          }
     }

     const categories = [];
     const totalSales = [];
     fr.forEach((e, i) => {
          if (e !== 0) {
               categories.push(category[i]);
               totalSales.push(e);
          }
     });

     console.log(categories, totalSales);
     res.json({ categoryDetails: categories, sales: totalSales });
});

// --------------------------------------change saleschart---------------------------------
const ChangeSalesChart = asyncHandler(async (req, res) => {
     const dt = new Date().toDateString();

     if (req.query.id == "Daily") {
          console.log(req.query.id);
          var total;
          var category;
          var productCount;
          var userCount;
          category = ["Total", "Profit"];

          //creating today

          //finding totalOrders in a day-----------------------------------------------------------

          const orders = await orderCollection.aggregate([
               {
                    $match: {
                         orderedAt: dt,
                    },
               },
               {
                    $group: {
                         _id: null,
                         totalSales: { $sum: "$total" },
                         productCount: { $sum: "$productsCount" },
                    },
               },
          ]);

          const profit = (orders[0].totalSales * 30) / 100;

          total = [orders[0].totalSales, profit];

          const user = await UserCollection.find({ signupAt: dt });

          var users = 1;
          console.log(total);
          res.json({ total: total, category: category, profit: profit, users: users });
     }
});

//admin  offers-------------------------------------------------------------------------------

const adminOfferControler = asyncHandler(async (req, res) => {
     const category = await categoryCollection.find({}).lean();
     const productoffer = await offerCollection.findOne({ productOffers: { $exists: true } });
     const referaloffer = productoffer.referalOffer;
     const offer = productoffer.productOffers;
     res.render("admin/offers", { offer, category, referaloffer });
});

//banner------------------------------------------------------------------

const bannerControler = asyncHandler(async (req, res) => {
    try{
        const banner = await  bannerCollection.findOne({}).lean()
        console.log(banner)

        res.render("admin/banner",{banner});
    }
    catch(error){
        console.log(error.message)
    }
});
const bannerControlerPost = asyncHandler(async (req, res) => {
     
     var image = req.file.filename;
     if(req.body.type==1){
        await bannerCollection.updateOne({},{
            $set:{
                image1:req.file.filename
            }
        },{upsert:true})}
     else{
        await bannerCollection.updateOne({},{
            $set:{
                image2:req.file.filename
            }
        },{upsert:true})
     }
     res.redirect("/admin/banner")
     
});

//delete banner-----------------------------------------------------------------------

const deleteBanner = asyncHandler(async(req,res)=>{
    var src = 'data:image/jpeg;base64,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'
    if(req.query.id==1){
        await bannerCollection.updateOne({},{
            $set:{
                image1:''
            }
        })
    }
    if(req.query.id==2){
        await bannerCollection.updateOne({},{
            $set:{
                image2:''
            }
        })
    }
        res.redirect("/admin/banner")
})
module.exports = {
     adminHome,
     adminLogin,
     adminLoginPost,
     adminLogout,
     adminCustomers,
     adminViewProducts,
     adminBlockUser,
     adminAddProduct,
     adminAddProductPost,
     adminDeleteProduct,
     adminViewProductCategoryVise,
     adminEditProduct,
     adminEditProductPost,
     changeImage,
     adminAddCategory,
     adminAddCategoryPost,
     adminViewCategory,
     deleteCategory,
     editCategory,
     editCategoryPost,
     editCategoryImage,
     categoryChartControler,
     ChangeSalesChart,
     adminOfferControler,
     bannerControler,
     bannerControlerPost,
     deleteBanner
};
