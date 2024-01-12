const express = require('express')
const session = require("express-session")
const {connection }= require("./config")
const app = express()
const bodyParser = require('body-parser')
const userRouter = require("./routes/user")
const adminRouter = require("./routes/admin")
const productsRouter = require("./routes/products")
const cartRouter = require("./routes/cart");
const profileRouter = require("./routes/profile");
const orderRoter = require('./routes/order')
const cors = require('cors')
app.use(cors())

const path = require("path")
const nocache = require('nocache')
const { createAdmin } = require('./middlewares/middleware')


const dotenv = require('dotenv').config()

app.use(express.json())



var hbs = require("express-handlebars").engine   
connection()
app.use(nocache())
app.use(session({secret:"Secretkey",cookie:{maxAge:6000000}}))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine",'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))
app.use('/',userRouter) 
app.use('/admin',adminRouter);
app.use('/products',productsRouter)
app.use("/cart",cartRouter)
app.use("/profile",profileRouter);
app.use('/order',orderRoter)




 
app.listen(3000,console.log('server started at port 3000'))


 
