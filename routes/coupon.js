const express = require("express");
const {adminViewCoupon, adminAddCoupon, adminAddCouponPost, adminDeleteCoupon, restrictCoupon, userViewCoupon} = require("../Controler/couponControler");
const app = express.Router();
const {upload} = require('../config')
app.get("/admin-view-coupon",adminViewCoupon);
app.get("/admin-add-coupon",adminAddCoupon);
app.post('/admin-add-coupon',upload.single('image'),adminAddCouponPost);
app.get("/admin-delete-coupon",adminDeleteCoupon);
app.get('/restrict-coupon',restrictCoupon);
app.get('/user-view-coupon',userViewCoupon)
module.exports = app;