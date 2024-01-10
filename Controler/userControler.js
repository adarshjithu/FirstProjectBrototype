const { otpAuthMiddleware, generateOTP } = require("../middlewares/middleware");
const asyncHandler = require("express-async-handler");
const UserCollection = require("../models/userModel");
const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModel")
const { body } = require("express-validator");
const bcrypt = require('bcrypt')
const cartCollection = require("../models/cartModel")

//landin controler
const landingControler = (req, res) => {
     res.redirect("/user_home");
};

//signupControler

const signupControler = (req, res) => {
     if (req.session.user) {
          res.redirect("/user_home");
     } else {
          res.render("user/signup", { home: true });
     }
};
//loginControler
const loginControler = (req, res) => {
     if (req.session.user) {
          res.redirect("/user_home");
     } else {
          res.render("user/login", { home: true });
     }
};

//loginpost controler

const loginPostControler = async (req, res) => {
     const user = await UserCollection.findOne({ email: req.body.email });

     if (user && (await user.isPasswordMatched(req.body.password))) {
          if (user.isActive == true) {
               req.session.user = user;

               res.redirect("/user_home");
          } else {
               res.render("user/login", { isActive: true });
          }
     } else {
          res.render("user/login",{logginError:true});
     }
};

//homeControler
const homeControler =asyncHandler(async (req, res) => {

   
     const category = await categoryCollection.find({}).lean()
     products = await productCollection.find({}).lean().limit(8)
     let cartCount = await cartCollection.findOne({user:req.session.user._id})
     var count;
     if(cartCount){
           count=cartCount.products.length
     }
     else{
          count=null
     }

     
    

     var USER;
     if (req.session.user) {
          USER = req.session.user.username;
     } else {
          USER = "";
     }

     res.render("user/home", {home:true,  user: USER ,category,products,
          count:count
     });
})
//contactControler
const contactControler = (req, res) => {
     res.render("user/contact", { home: true });
};

//aboutControler
const aboutControler = (req, res) => {
     res.render("user/about",{home:true});
};
//siguppostcontroler
const signupPostControler = asyncHandler(async (req, res) => {
   
    
     try {
          const user = await UserCollection.findOne({ email: req.body.email });
          if (!user) {
               req.session.user = req.body;

               res.redirect("/user_otp");
          } else {
               res.render("user/signup", { emailFind: true,home:true });
          }
     } catch (error) {
          throw new Error(error.message);
     }
});

//otp controler
const otpControler = (req, res) => {
     generateOTP(req.session.user.email).then((OTP) => {
          req.session.otp = OTP;

          res.redirect("/user_generate");
     });
};

//Generate otp
const OTPgeneration = (req, res) => {
     res.render("OTP/otp", { ph: req.session.user.email });
};
//otp post controler

const otpPostControler = asyncHandler(async (req, res) => {
     if (req.body.otp == req.session.otp) {
          const userObj = await UserCollection.create(req.session.user);
          console.log('userobject'+ userObj)
          req.session.user=userObj

          res.redirect("/user_home");
     } else {
          res.redirect("/user_otpError");
     }
});

//otp error
const otpError = (req, res) => {
     res.render("OTP/otpErr");
};

//user reset password
 
const userResetPassword =async (req,res)=>{
     res.render("user/reset-password",{email:req.session.user.email})
}
 
//user reset password post 
const userResetPasswordPost = async (req,res)=>{
     const userFound = await UserCollection.findOne({email:req.body.email});
     
         if(userFound){
          req.session.resetEmail= req.body.email;
         
          res.render('user/reset-password-user-found',{email:userFound.email})
              
         }
         else{

              res.render("user/usernot-found")
         }

}
//pasword reset succuss

const passwordResetSuccessPost =asyncHandler(async(req,res)=>{
     const email= req.session.resetEmail;
     const salt = 10;
     const password=await bcrypt.hash( req.body.password,salt);

       try{
          const newUser = await UserCollection.findOneAndUpdate({email:email},{password:password});
          
          req.session.user=newUser;
           res.render("user/password-change-success-page")   
 
       }
       catch(error){
          throw new Error(error.message)
       }

    
     
       

} )

//userprofile

const userProfile=async (req,res)=>{
     res.render("user/profile",{home:true})
}

///logout controler

const logout = (req,res)=>{
     req.session.user=null;
     res.redirect("user_home");
}


////forgot password

const forgotPassword =(req,res)=>{

     res.render('user/forgot-password')
}

//forgotpassword post controler

const forgotPasswordPost =asyncHandler(async(req,res)=>{

     try{
            const userFound = await UserCollection.findOne({email:req.body.email});
            if(userFound.isActive){

                 if(userFound){
                    req.session.forgotPasswordEmail=req.body.email;
                   
     
                         res.redirect('/forgot-password-generate-otp')
                 }
                 else{
                    res.render('user/forgot-password',{userNotFound:true})
                 }
            }
            else{
               res.render("user/login",{isActive:true})
            }
     }
     catch(error){
          throw new Error(error.message)
     }
    
          
})

//forgot password generate otp

const forgotPasswordGenerateOtp = asyncHandler(async (req,res)=>{
   
     
     generateOTP(req.session.forgotPasswordEmail).then((OTP)=>{
             req.session.otp=OTP;
             res.redirect("forgot-password-check-otp")
     })
}
)

//forgot password checkotp

const forgotPasswordCheckOtp = asyncHandler(async(req,res)=>{
     try{
          res.render('user/forgot-password-check-otp',{email:req.session.forgotPasswordEmail})

     }
     catch(error){
          throw new Error(error.message);
     }
})
//FORGOT PASSWORD CHECK OTP POST 

const forgotPasswordCheckOtpPost = asyncHandler(async(req,res)=>{
     try{

          if(req.session.otp==req.body.otp){
               req.session.user=await UserCollection.findOne({email:req.session.forgotPasswordEmail});
               
               res.redirect("user_resetpassword")
               
          }
          else{ 

            res.render('user/forgotpassword-failed')
          }
          

     }
     catch(error){
          throw new Error(error.message);
     }
})



///user view products

const userViewProducts = asyncHandler(async(req,res)=>{
     
     var products;
     var count;
     let cartCount = await cartCollection.findOne({user:req.session.user._id})
     if(cartCount){
          count = cartCount.products.length
     }
     else{
          count=null
     }
    
       
     if(req.session.search)
     {
           products = await productCollection.find({category:{$regex:req.session.search,$options:'i'}}).lean()
           const category = await categoryCollection.find({}).lean()
           res.render("user/view-products",{products,category,user:req.session.user._id,count:count})
          

     }
     else{

          products =await productCollection.find({}).lean()
          const category = await categoryCollection.find({}).lean()
          if(products){
     
               res.render("user/view-products",{products,category,user:req.session.user._id,count:count})
             
          }
     }
})

//product details page
const productDetails = asyncHandler(async(req,res)=>{
  
     const product = await productCollection.findOne({_id:req.query.id}).lean();
     const products= await productCollection.find({}).lean().limit(2);
     const image1=product.subImage[0];
     const image2=product.subImage[1];
     const image3=product.subImage[2];
     const image4=product.subImage[3];
     const image5=product.subImage[4];

   

     

     res.render('user/product-details',{product,products,image1,image2,image3,image4,image5})
})

//changeProductCategory 

const changeProductCategory=asyncHandler(async(req,res)=>{
     
     // console.log(req.params.id)
     
     const category= await categoryCollection.find({}).lean();
     const products = await productCollection.find({category:req.params.id}).lean();
     

     req.session.products=products;
     req.session.category=category;

     if(products){

          res.redirect("/changed")
     }
     // console.log(req.params.id)
     
     // const category= await categoryCollection.find({}).lean();
     // const products = await productCollection.find({category:req.params.id}).lean();
     // if(products){
     //      res.render("user/view-products",{home:true,products,category})
     // }





})


const changed=(req,res)=>{
     const category= req.session.category;
     const products= req.session.products;
     res.render("user/view-products",{home:true,products,category})

}


const blog =(req,res)=>{
     res.render("user/blog",{home:true})
}
/////////////////////////



module.exports = {
     landingControler,
     signupControler,
     loginControler,
     homeControler,
     contactControler,
     aboutControler,
     signupPostControler,
     otpControler,
     otpPostControler,
     loginPostControler,
     OTPgeneration,
     otpError,
     userResetPassword,
     userResetPasswordPost,
     passwordResetSuccessPost,
     userProfile,
     logout,
     forgotPassword,
     forgotPasswordPost,
     forgotPasswordGenerateOtp,
     forgotPasswordCheckOtp,
     forgotPasswordCheckOtpPost,
     userViewProducts,
     productDetails,
     changeProductCategory,
     changed,
     blog
   
};
