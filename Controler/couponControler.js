const asyncHandler = require("express-async-handler");
const couponCollection = require("../models/couponModel");
const cartCollection = require("../models/cartModel")
//admincoupon

const adminViewCoupon = asyncHandler(async (req, res) => {
     try{
          
          const coupon = await couponCollection.find({}).sort({ _id: -1 }).lean();
          
     
          res.render("coupon/admin-view-coupon", { coupon });
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
});

//addcoupon

const adminAddCoupon = asyncHandler(async (req, res) => {
     try{
     res.render("coupon/admin-add-coupon");
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
});

///admin add coupon post

const adminAddCouponPost = asyncHandler(async (req, res) => {
     try{
     req.body.image = req.file.filename;

     await couponCollection.create(req.body);
     res.redirect("/coupon/admin-view-coupon");
}
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
});

//admin delete coupon
const adminDeleteCoupon = asyncHandler(async (req, res) => {
     try{
     await couponCollection.findOneAndDelete({ _id: req.query.id });
     res.redirect("/coupon/admin-view-coupon");
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
});

//restrict coupon

const restrictCoupon = asyncHandler(async (req, res) => {
     try{

          console.log(req.query.couponId, req.query.userId);
          await couponCollection.updateOne(
               { _id: req.query.couponId },
               {
                    $push: { users: req.query.userId },
               }
          );
     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err)
          
     }
});

//user view coupon

const userViewCoupon = asyncHandler(async (req, res) => {
     try{
           //finding total amount for displaying coupons
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
                    discount: { $sum: { $multiply: ["$count", "$product.discount"] } },
               },
          },
     ]);
     var total = cartDatas[0].total-cartDatas[0].discount
     const coupons = await couponCollection.aggregate([{ $match: { minimumpurchase: { $lt: total } } }]);
     const allCoupons = await couponCollection.find({}).lean()
     var coupon = coupons.filter((e) => {
          return !e.users.includes(req.session.user._id);
     });
     console.log(allCoupons)
   

     res.render("coupon/user-view-coupon",{coupon,allCoupons,home:true});

     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 500;
          next(err)
          
     }
     
    
});
module.exports = { userViewCoupon, adminViewCoupon, adminAddCoupon, adminAddCouponPost, adminDeleteCoupon, restrictCoupon };
