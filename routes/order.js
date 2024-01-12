const express = require('express');
const { adminViewOrder, adminDeleteOrder, userOrderHistory, userOrderDetails, userOrderCancel, userOrderConfirm, adminEditOrder, changeOrderStatus } = require('../Controler/orderControler');
const {verifyAdmin} = require('../middlewares/middleware')
const app = express.Router();

app.get("/admin-view-orders",adminViewOrder);

app.get("/delete-order",adminDeleteOrder)

app.get("/order-history",userOrderHistory);

app.get("/user-order-details",userOrderDetails);

app.get("/user-order-cancel",userOrderCancel);

app.get("/user-order-confirm",userOrderConfirm);

app.get("/admin-edit-order", adminEditOrder);

app.get("/change-order-status",changeOrderStatus)

module.exports = app;