const { check, validationResult, body } = require("express-validator");
var nodemailer = require('nodemailer');
////validationmiddlewares signup
const validationRules = [
     body("username")
          .isAlpha()
          .not()
          .isEmpty()
          .isLength({ min: 4 })
          .withMessage("userName Must be minimim 4 characters ")
          .isLength({ max: 10 })
          .withMessage("Username should not be more than 10 characteres")
          .matches(/^[a-zA-Z0-9 ]+$/)
          .withMessage("Special charectors not allowed"),
     body("email").isEmail().withMessage("Enter a valid email address").not().isEmpty(),
     body("password")
          .not()
          .isEmpty()
          .withMessage("Password required")
          .isLength({ min: 6 })
          .withMessage("Password must be atleast 6 charectors long")
          .custom((value) => {
               // Check if the password contains at least one special character
               if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                 throw new Error('Password must contain at least one special character');
               }
               return true;
             }),
        
     body("confirmpassword").custom((value, { req }) => {
          if (value !== req.body.password) {
               throw new Error("Password donot match");
          }
          return true;
     }),
     body("phonenumber")
          .not()
          .isEmpty()
          .withMessage("Phone number required")
          .isNumeric()
          .isLength({ min: 10, max: 10 })
          .withMessage("Phone number must be 10 digit")
          .custom((value)=>{
               if(value<0){
                    throw new Error("Number must be not negetive")
               }
               return true;
          }),
];

//validation middleware signup
const validationRes = (req, res, next) => {
     const error = validationResult(req);
 
     if (!error.isEmpty()) {
          res.render("user/signup", { err: error.mapped() });
     } else {
          next();
     }
};


//validation middleware for login


const validationLoginRules =[
     body("email").isEmail().withMessage("Enter a valid email address").not().isEmpty(),
     body("password")
     .not()
     .isEmpty()
     .withMessage("Password required")
     .isLength({ min: 6 })
     .withMessage("Password must be atleast 6 charectors long")
     .custom((value) => {
          // Check if the password contains at least one special character
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            throw new Error('Password must contain at least one special character');
          }
          return true;
        }),
   

]

const  loginValidationRes = (req,res,next)=>{
     const error = validationResult(req);
     console.log(error.mapped())
     if (!error.isEmpty()) {
          res.render("user/login", { err: error.mapped() });
     } else {
          next();
     }
}
//otp authenticaion middleware

const generateOTP =(email)=>{

const random = Math.floor(Math.random()*1000000);


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'adarshjithu10@gmail.com',
    pass: 'tecw wysm eyjm cmgi'
  }
});

var mailOptions = {
  from: 'adarshjithu10@gmail.com',
  to: email,
  subject: 'Sending Email using Node.js',
  text: `Your one time verification code is ${random}`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('success')
    console.log('Email sent: ' + info.response);
  }
});

return random;

}

module.exports = { validationRules, validationRes ,generateOTP,validationLoginRules,loginValidationRes};
