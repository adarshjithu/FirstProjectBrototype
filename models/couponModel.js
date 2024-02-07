const mongoose = require("mongoose");
const couponSchama = new mongoose.Schema({
     minimumpurchase: Number,
     status: { type: String, default: "Active" },
     couponname: String,
     discount: Number,
     image: String,
     startdate: { type: String },
     expirydate: String,
     couponcode: {
          type: Number,
          default: function () {
               return Math.floor(Math.random() * 10000000) + 1;
          },
     },

     createdAt: {
          type: String,
          default: function () {
               return new Date().toLocaleDateString();
          },
     },
     users:Array
});

const Coupon = mongoose.model("Coupon", couponSchama);
module.exports = Coupon;
