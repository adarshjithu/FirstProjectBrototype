const express = require('express')
const app = express()
 
const userRouter = require("./routes/user")
const adminRouter = require("./routes/admin")
const path = require("path")
var hbs = require("express-handlebars").engine

app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine",'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))
app.use('/',userRouter) 
app.use('/admin',adminRouter) 
 
app.listen(3000,console.log('server started at port 3000'))


 
