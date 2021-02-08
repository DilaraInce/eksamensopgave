const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const checkAuth = require('../Middleware/check-auth');
const User = require ("../model/user");

router.get('/all', (req, res, next) => {
  User.find().lean()
  .then(function(doc) {
    res.render('index', {users: doc});
  });
});

controller.get('/signup', (request, response) => {
  response.render('signup');
});

// Der er forneden kodet en masse endpoints som giver bestemte output, beskrevt undervejs. 
//signup endpoint 
controller.post('/signup', (req, res, next) => {
  User.find( {email: req.body.email})
  .exec()
  .then(user => {
    if (user.length >= 1) {
      return res.status(409).json({
        message:"Mail exists"
      });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err
          }); 
        } else {
          const user = new User({
            _id: mongoose.Types.ObjectId(),
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            country: req.body.country,
            bio: req.body.bio,
            gender: req.body.gender,
            likes: [],
            dislikes: [],
            matches: [],
            password: hash
          });
          user
          .save()
          .then(result => {
            console.log(result);
            res.render('success', {name: req.body.name, action: 'created!'})
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


//Dette er et endpoint for at kunne login  
controller.post("/login", (req, res, next) => {
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
              userId: user[0]._id
            },
            "secret",
            {
                expiresIn: "1h"
            }
          );
          res.cookie('authcookie',token,{maxAge:900000,httpOnly:true});
          return res.redirect('/');
        }
        return res.status(401).json({
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

//logout endpoint 
controller.post("/logout", (req, res, next) => {
  res.cookie('authcookie','',{ maxAge:1 });
  res.redirect('/');
})

controller.get("/account", checkAuth, (req, res, next) => {
  User.findById(req.userData.userId)
  .exec()
  .then(user => {
    res.render('edit', {bio: user.bio, name: user.name, age: user.age, country: user.country, userId: req.userData.userId});
  })
  .catch(err => {
    console.log(err);
  })
});
// Dette er et endpoint "findbyId" som sørger for at jeg kan søge efter et oprettet bruger.  
controller.get("/:userID", checkAuth, (req, res, next) => {
  User.findById(req.params.userID)
  .exec()
  .then(user => {
    console.log(user.email)
    res.status(200).json({
      message: "User found"
    })
  })
  .catch(err => {
    console.log(err)
  })
});
// findByIdAndUpdate endpoint bruges her, til at kunne finde en bruger og opdaterer bruges indformationer 
controller.post("/u/:userID", checkAuth, (req, res, next) => {
  User.findByIdAndUpdate({_id: req.params.userID},
    {
    "name": req.body.name, 
    "age": req.body.age,
    "country": req.body.country,
    "bio": req.body.bio,
    "gender": req.body.gender
  }, function(err, result){
    if(err){
        res.send(err);
    }
    else{
        res.render('success', {name: req.body.name, action: 'updated'});
    }
 });
});

//findByAndRemove endpoint bruges her til at finde en bruger og slette den. 
controller.post("/d/:userID", checkAuth, (req, res, next) => {
  User.findByIdAndRemove({_id: req.params.userID})
  .exec()
  .then(user => {
    res.render('success', {name: user.name, action: 'deleted'})
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err 
    });
  });
});

module.exports = controller;