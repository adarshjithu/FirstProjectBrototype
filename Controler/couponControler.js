const asyncHandler = require("express-async-handler");
const couponCollection = require("../models/couponModel");
const cartCollection = require("../models/cartModel")
const categoryCollection = require("../models/categoryModel")
//admincoupon--------------------------------------------

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

//addcoupon----------------------------------------------------------------------------

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

///admin add coupon post---------------------------------------------------------------------

const adminAddCouponPost = asyncHandler(async (req, res) => {


     try{
     const startDate = new Date(req.body.startdate);
     const expiryDate = new Date( req.body.expirydate)
     if(expiryDate>= startDate){
          
               await couponCollection.create(req.body);
               res.redirect("/coupon/admin-view-coupon");
               
          }
          else{
          res.redirect("/coupon/admin-view-coupon");
          
     }

}
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
});

//admin delete coupon---------------------------------------------------------------------
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

//restrict coupon-----------------------------------------------------------------------------

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

//user view coupon-----------------------------------------------------------

const userViewCoupon = asyncHandler(async (req, res) => {
     try{
    
     //passing category offers

     const category = await categoryCollection.find({}).lean()
     console.log(category)
     
     const allCoupons = await couponCollection.find({}).lean()
     var coupon = allCoupons.filter((e) => {
          return !e.users.includes(req.session.user._id);
     });
     console.log(coupon)
   

     res.render("coupon/user-view-coupon",{coupon,home:true,category});

     }
     catch(error){
          console.log(error.message);
          var err = new Error();
          error.statusCode = 400;
          next(err)
          
     }
     
    
});


///change Coupon status----------------------------------------------------------

const changeCouponStatus =  asyncHandler(async(req,res)=>{

 console.log(req.query.id)
     const coupon =  await couponCollection.findOne({_id:req.query.id});
     console.log(coupon)
     if(coupon.isActive == true){
          await couponCollection.updateOne({_id:req.query.id},{
               $set:{isActive:false}
          })
     }
     else{

          await couponCollection.updateOne({_id:req.query.id},{
               $set:{isActive:true}
          })
     }
  
     

     res.json({success:true})
})



// ---------------------------------------------EditCoupon------------------------------------

const editCouponControler = asyncHandler(async(req,res)=>{
     try{

          console.log(req.query.id)
          const coupon = await couponCollection.findOne({_id:req.query.id});
          console.log(coupon)
          res.json({coupon})
     }
     catch(error){
          console.log(error.message)
     }
})

// ------------------------------------Edit coupon post-------------------------------------------------------------

const editCouponPost  = asyncHandler(async(req,res)=>{
 
     if(req.body.startdate==''){
          delete req.body.startdate
     }
     if(req.body.expirydate==''){
          delete req.body.expirydate;
     }
     await couponCollection.findByIdAndUpdate({_id:req.body.id},req.body);
     res.redirect("/coupon/admin-view-coupon")
})

module.exports = { userViewCoupon, adminViewCoupon, adminAddCoupon, adminAddCouponPost, adminDeleteCoupon, restrictCoupon
,changeCouponStatus,editCouponControler,editCouponPost };
