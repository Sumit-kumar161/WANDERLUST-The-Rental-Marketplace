const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");

router.route("/signup")
.get(userController.RenderSignupForm)
.post(wrapAsync(userController.signup));


router.route("/login")
.get(userController.RenderLoginForm)
.post(saveRedirectUrl,
    passport.authenticate("local", {failureRedirect: '/login', failureFlash:true}), userController.login);

router.get("/logout",userController.logout);

router.get("/", (req,res)=>{
    res.redirect("/listings");
})

module.exports = router;