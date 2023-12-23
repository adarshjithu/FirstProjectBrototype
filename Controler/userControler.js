const { otpAuthMiddleware, generateOTP } = require("../middlewares/middleware");
const asyncHandler = require("express-async-handler");
const UserCollection = require("../models/userModel");
const { body } = require("express-validator");
const bcrypt = require('bcrypt')

//landin controler
const landingControler = (req, res) => {
     res.render("user/landing", { landing: true });
};

//signupControler

const signupControler = (req, res) => {
     if (req.session.user) {
          res.redirect("/user_home");
     } else {
          res.render("user/signup", { landing: true });
     }
};
//loginControler
const loginControler = (req, res) => {
     if (req.session.user) {
          res.redirect("/user_home");
     } else {
          res.render("user/login", { landing: true });
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
          res.redirect("/user_login");
     }
};

//homeControler
const homeControler = (req, res) => {
     var USER;
     if (req.session.user) {
          USER = req.session.user.username;
     } else {
          USER = "";
     }

     res.render("user/home", { home: true, user: USER });
};
//contactControler
const contactControler = (req, res) => {
     res.render("user/contact", { landing: true });
};

//aboutControler
const aboutControler = (req, res) => {
     res.render("user/about", { landing: true });
};
//siguppostcontroler
const signupPostControler = asyncHandler(async (req, res) => {
     try {
          const user = await UserCollection.findOne({ email: req.body.email });
          if (!user) {
               req.session.user = req.body;

               res.redirect("/user_otp");
          } else {
               res.render("user/signup", { emailFind: true });
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
     res.render("user/otp", { ph: req.session.user.email });
};
//otp post controler

const otpPostControler = asyncHandler(async (req, res) => {
     if (req.body.otp == req.session.otp) {
          const userObj = await UserCollection.create(req.session.user);

          res.redirect("/user_home");
     } else {
          res.redirect("/user_otpError");
     }
});

//otp error
const otpError = (req, res) => {
     res.render("user/otpErr");
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
           res.redirect("/user_home")   
 
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
            if(userFound){
               req.session.forgotPasswordEmail=req.body.email;
              

                    res.redirect('/forgot-password-generate-otp')
            }
            else{
               res.render('user/forgot-password',{userNotFound:true})
            }
     }
     catch(error){
          throw new Error(error.message)
     }
    
          
})

//forgot password generate otp

const forgotPasswordGenerateOtp = asyncHandler(async()=>{
     
     // generateOTP(req.session.forgotPasswordEmail).then((data)=>{
     //      console.log(data)
     // })
}
)
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
     forgotPasswordGenerateOtp
   
};
