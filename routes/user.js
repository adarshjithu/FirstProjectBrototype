const express = require("express");
const { landingControler, signupControler, contactControler, aboutControler, homeControler, loginControler, signupPostControler, otpControler, otpPostControler, loginPostControler } = require("../Controler/userControler");
const { validationRules, validationRes, otpAuthMiddleware, validationLoginRules, loginValidationRes } = require("../middlewares/middleware");

const app = express.Router();

////routes
app.get("/", landingControler);
app.get("/user_contact",contactControler)
app.get("/user_about",aboutControler) 
app.get("/user_home",homeControler)
app.get("/user_login",loginControler)
app.post("/user_login",validationLoginRules,loginValidationRes,loginPostControler)
app.get("/user_signup",signupControler)
app.post("/user_signup",validationRules,validationRes,signupPostControler)
app.get('/user_otp',otpControler)
app.post('/user_otp',otpPostControler)

module.exports = app;
