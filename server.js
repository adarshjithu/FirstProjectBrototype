const express = require('express')
const session = require("express-session")
const connection = require("./config")
const app = express()
const bodyParser = require('body-parser')
const userRouter = require("./routes/user")
const adminRouter = require("./routes/admin")
const path = require("path")
const dotenv = require('dotenv').config()
app.use(express.json())


var hbs = require("express-handlebars").engine 
connection()
app.use(session({secret:"Secretkey",cookie:{maxAge:6000000}}))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine",'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))
app.use('/',userRouter) 
app.use('/admin',adminRouter) 

 
app.listen(3000,console.log('server started at port 3000'))


 
