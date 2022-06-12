const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

//passport
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

//Models
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");

//Multer
const multer = require("multer");

//MULTER
const Storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e5) + "-" + file.originalname);
  },
});

const upload = multer({
  storage: Storage,
}).single("testImage");

//REGISTER

router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register", {
    layout: "LayoutA",
  });
});

router.post("/register", forwardAuthenticated, async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  upload(req, res, (err) => {
    console.log(req.body);
    console.log(req.file);
    let transport = [];
    let isVerified;

    const { name, email, password, password2, phoneNumber, gender, roles, dob, bus = undefined, car = undefined, truck = undefined, bike = undefined } = req.body;

    if (roles == "user" || roles == "customer") {
      isVerified = true;
    } else {
      isVerified = false;
    }

    if (bus || car || truck || bike) {
      if (bus) transport.push(bus);
      if (car) transport.push(car);
      if (truck) transport.push(truck);
      if (bike) transport.push(bike);
    }
    console.log(transport);

    let errors = [];

    if (!name || !email || !password || !password2 || !phoneNumber || !gender || !roles || !dob) {
      errors.push({ msg: "please fill in all the details " });
    }

    if (password !== password2) {
      errors.push({ msg: "passwords do not match" });
    }

    if (errors.length > 0) {
      res.render("register", {
        errors,
        name,
        email,
        password,
        password2,
        layout: "LayoutA",
      });
    } else {
      User.findOne({ email: email }).then((user) => {
        if (user) {
          errors.push({ msg: "Email is already used" });
          res.render("register", {
            errors,
            name,
            email,
            password,
            password2,
            layout: "LayoutA",
          });
        } else {
          try {
            if (err) {
              console.log(err);
              res.send(err);
            } else {
              bcrypt.genSalt(10).then((salt) => {
                bcrypt.hash(password, salt).then((hashedPassword) => {
                  const newUser = new User({
                    name,
                    email,
                    password: hashedPassword,
                    image: {
                      data: `/images/${req.file.filename}`,
                      contentType: "image/png",
                    },
                    phoneNumber,
                    gender,
                    roles,
                    isVerified,
                    transport: transport,
                    dob,
                  });
                  newUser
                    .save()
                    .then((createdUser) => {
                      req.flash("success_msg", "You are now registered and can log in");
                      res.redirect("/users/login");
                    })
                    .catch((err) => console.log(err));
                });
              });
            }
          } catch (error) {
            console.log(error);
            res.send(error);
          }
        }
      });
    }
  });
});

//LOGIN
router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login", {
    layout: "LayoutA",
  });
});

router.post("/login", forwardAuthenticated, (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//CHANGE PASSWORD

router.get("/changepassword", ensureAuthenticated, (req, res, next) => {
  res.render("changepassword", {
    layout: "LayoutA",
  });
});

router.post("/changepassword", ensureAuthenticated, async (req, res) => {
  if (req.body.password && req.body.password2 && req.body.password === req.body.password2) {
    console.log(req.body.password);

    bcrypt
      .genSalt(10)
      .then((salt) => {
        bcrypt
          .hash(req.body.password, salt)
          .then((hashedPassword) => {
            let previousPassword = req.user.fulluser.password;
            let _id = req.user.fulluser._id;
            console.log(_id);
            console.log(req.user);

            User.findByIdAndUpdate(_id, { password: hashedPassword }, { new: true })
              .then((docs) => {
                if (previousPassword === docs.password) {
                  console.log("data didnt update", docs);
                  res.send("data didnt update");
                } else {
                  console.log("data did update", docs);
                  res.send("data did update");
                }
              })
              .catch((error) => {
                console.log(error);
                return res.send(error);
              });
          })
          .catch((error) => {
            console.log(error);
            return res.send(error);
          });
      })
      .catch((error) => {
        console.log(error);
        return res.send(error);
      });
  } else {
    return res.send("Either you have not provided all the fields or your password dont match");
  }
});

//PRODUCTS

router.get("/addproduct", ensureAuthenticated, (req, res) => {
  res.render("productform", {
    layout: "LayoutA",
  });
});

router.post("/addproduct", ensureAuthenticated, (req, res) => {
  let errors = [];

  upload(req, res, (err) => {
    let { productID, name, productCategory, productDescription, price, productRating, productTags } = req.body;

    productTags = productTags.split(",");
    // console.log(productID, name, productCategory, productDescription, price, productRating, productTags);
    if (!productID || !name || !productCategory || !productDescription || !price || !productRating || !productTags) {
      errors.push({ msg: "please fill in all the details " });
    }

    if (productRating < 0) {
      errors.push({ msg: " You cannot rate below zero " });
    }
    if (productRating > 5) {
      errors.push({ msg: " You cannot rate above 5" });
    }

    if (errors.length > 0) {
      productTags = productTags.join(",");
      console.log(errors, productID, name, productCategory, productDescription, productRating, price, productTags);
      res.render("productform", {
        errors,
        productID,
        name,
        productCategory,
        productDescription,
        productRating,
        price,
        productTags,
        layout: "LayoutA",
      });
    } else {
      Product.findOne({ productID: productID }).then((data) => {
        if (data) {
          errors.push({ msg: "Product ID  is already used" });
          res.render("productform", {
            errors,
            productID,
            name,
            productCategory,
            productDescription,
            price,
            layout: "LayoutA",
          });
        } else {
          try {
            if (err) {
              console.log(err);
              res.send(err);
            } else {
              const newProduct = new Product({
                productID,
                name,
                productCategory,
                productDescription,
                price,
                adder: req.user.username,
                image: {
                  data: `/images/${req.file.filename}`,
                  contentType: "image/png",
                },
              });

              newProduct
                .save()
                .then((createdUser) => {
                  req.flash("success_msg", "product Added to Stocks");
                  res.redirect("/users/addproduct");
                })
                .catch((err) => console.log(err));
            }
          } catch (error) {
            console.log(error);
            res.send(error);
          }
        }
      });
    }
  });
});

//LOGOUT HANDLE

router.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success_msg", "You successfully Logged out");
    res.redirect("/users/login");
  });
});

module.exports = router;
