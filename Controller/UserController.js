const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const checkAuth = require('../Middleware/check-auth');
const User = require ("../model/user");

router.post("/signup", (req, res, next) => {
    console.log(req.body.password)
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length >= 1) {
          return res.status(409).json({
            message: "Mail exists"
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                console.log(err)
              return res.status(500).json({
                error: err
              });
            } else {
              const user = new User({
                _Id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
              });
              user
                .save()
                .then(result => {
                  console.log(result);
                  res.status(201).json({
                    message: "User created"
                  });
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    error: err
                  });
                });
            }
          });
        }
      });
  });

  router.post("/login", (req, res, next) => {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._Id
              },
              "secret",
              {
                  expiresIn: "1h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              token: token
            });
          }
          res.status(401).json({
            message: "Auth failed"
          });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

  router.get("/:userId", checkAuth, (req, res, next) => {
    User.findById(req.params.userId)
    .exec()
    .then(use => {
      console.log(user.email)
      res.status(200).json({
        message:"user found"
      })
    })
    .catch(err => {
      console.log(err)
    })
  });

  router.post("/u/:userId", checkAuth, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, {})
    .exec()
    .then()
  });
    
router.post('/d/:userId', checkAuth, (req, res, next) => {
    User.remove({_Id: req.params.userId })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'User deleted'
        });
    })
    .catch(err => {
        console.log(err); 
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;