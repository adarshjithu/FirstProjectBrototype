const landingControler = (req,res)=>{
    res.render("user/landing")

}
////////////////////////////

const signupControler = (req,res)=>{
    res.render("user/signup")
}
const loginControler = (req,res)=>{
    res.render("user/login")
}
const homeControler = (req,res)=>{
    res.render("user/home")
}
const contactControler = (req,res)=>{
    res.render("user/contact")
}
const aboutControler = (req,res)=>{
    res.render("user/about")
}
module.exports = {landingControler,signupControler,loginControler
    ,homeControler,contactControler,aboutControler}