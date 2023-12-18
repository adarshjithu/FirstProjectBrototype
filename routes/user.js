const express = require("express");
const { landingControler, signupControler, contactControler, aboutControler, homeControler, loginControler } = require("../Controler/userControler");
const app = express.Router();

////routes
app.get("/", landingControler);
app.get("/user_signup",signupControler)
app.get("/user_login",loginControler)
app.get("/user_contact",contactControler)
app.get("/user_about",aboutControler)
app.get("/user_home",homeControler)


module.exports = app;
