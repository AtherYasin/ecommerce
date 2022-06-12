const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/emailConfig");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

const User = require("../models/UserModel");
const Product = require("../models/ProductModel");

//INDEX OR HOMEPAGE
router.get("/", (req, res) => {
  res.render("index", {
    name: req?.user?.fulluser?.name,
    roles: req?.user?.fulluser?.roles,
    isVerified: req?.user?.fulluser?.isVerified,
  });
});

router.get("/index", (req, res) => {
  console.log(req.user);

  res.redirect("/");
});

//ADMIN PANEL

// USERS
router.get("/adminpanel", (req, res) => {
  console.log("adminpanel");
  if ((req?.user?.fulluser?.roles == "superadmin" || req?.user?.fulluser?.roles == "superadmin") && req?.user?.fulluser?.isVerified) {
    res.render("adminpanel", {
      name: req?.user?.fulluser?.name,
      roles: req?.user?.fulluser?.roles,
      isVerified: req?.user?.fulluser?.isVerified,
      layout: "LayoutA",
    });
  } else {
    res.redirect("/");
  }
});

router.get("/adminpanel/allusers", async (req, res) => {
  console.log("allusers");
  const allusers = await User.find();
  console.log(allusers);
  res.render("allusers", {
    allusers,
    layout: "LayoutB",
  });
});

router.get("/adminpanel/delete/:id", async (req, res) => {
  const data = await User.findOneAndDelete({ _id: req.params.id });
  console.log(data);
  res.redirect("/adminpanel/allusers");
});

//PRODUCTS

router.get("/adminpanel/allproducts", async (req, res) => {
  console.log("allproducts");
  const allproducts = await Product.find();
  console.log(allproducts);
  res.render("allproducts", {
    allproducts,
    layout: "LayoutB",
  });
});

//Navbarlinks

router.get("/about", (req, res) => {
  res.render("about", {
    name: req?.user?.fulluser?.name,
    roles: req?.user?.fulluser?.roles,
  });
});

router.get("/contact", (req, res) => {
  res.render("contact", {
    name: req?.user?.fulluser?.name,
    roles: req?.user?.fulluser?.roles,
  });
});

router.get("/buy", (req, res) => {
  res.render("buy", {
    name: req?.user?.fulluser?.name,
    roles: req?.user?.fulluser?.roles,
  });
});

router.get("/medicine", (req, res) => {
  res.render("medicine", {
    name: req?.user?.fulluser?.name,
    roles: req?.user?.fulluser?.roles,
  });
});

router.get("/news", (req, res) => {
  res.render("news", {
    name: req?.user?.fulluser?.name,
    roles: req?.user?.fulluser?.roles,
  });
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    name: req.user.fulluser.name,
    layout: "LayoutA",
  });
});

router.get("/forgetpassword", (req, res, next) => {
  res.render("forgetpassword", {
    layout: "LayoutA",
  });
});

router.post("/forgetpassword", (req, res, next) => {
  const { email } = req.body;
  if (email) {
    UserModel.findOne({ email }).then((user) => {
      console.log(user);
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "15m" });
        const link = `http://localhost:8000/api/user/reset/${user._id}/${token}`;
        console.log(link);
        console.log(process.env.EMAIL_FROM, user.email);
        transporter
          .sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "Geekshop -password Reset Link",
            html: `<a href=${link}> Click here </a> to Reset your Passord`,
          })
          .then((info) => {
            console.log(info);

            res.send(`The link to change password has been sent to ${email}`);
          });
      } else {
        res.send({ status: "failed", message: "email doesn't exists" });
      }
    });
  } else {
    res.send({ status: "failed", message: "Email field is required" });
  }
});

router.get("/api/user/reset/:id/:token", (req, res) => {
  res.render("resetpassword", {
    layout: "LayoutA",
  });
});

router.post("/api/user/reset/:id/:token", (req, res) => {
  console.log(req.body);
  const { password, password2 } = req.body;
  const { id, token } = req.params;
  UserModel.findById(id).then((user) => {
    const new_secret = user.id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);

      if (password && password2 && password === password2) {
        bcrypt.genSalt(10).then((salt) => {
          bcrypt.hash(password, salt).then((newHashPassword) => {
            UserModel.findByIdAndUpdate(user._id, { password: newHashPassword }, { new: true }).then((result) => {
              console.log("result", result);
              res.send({
                status: "success",
                message: "Password changed Succesfully",
              });
            });
          });
        });
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  });
});

router.get("/addproduct", ensureAuthenticated, (req, res) => {
  res.render("productform", {
    layout: "LayoutA",
  });
});

module.exports = router;
