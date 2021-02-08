var express = require('express');
var router = express.Router();
const checkAuth = require('../Middleware/check-auth');
const User = require('../Model/user');
const mongoose = require("mongoose");

router.get('/matches', checkAuth, function(req, res, next) {
    console.log(req.userData.userId);
    User.findById(req.userData.userId)
    .exec()
    .then( user => {

        let objectIdArray = user.matches.map(s => mongoose.Types.ObjectId(s));
        console.log(objectIdArray);
        User.find({

            _id: { $in: objectIdArray },
        })
        .lean()
        .then(function(doc) {
            console.log(doc);
            return res.render('matches', {users: doc});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err 
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

router.post('/d/match/:userID', checkAuth, function(req, res, next) {
    User.findById(req.userData.userId)
    .exec()
    .then( user => {

        console.log(user.likes);
        if (user.likes.includes(req.params.userID)) {
            console.log('deleting match');

            User.findByIdAndUpdate({_id: req.userData.userId},
                {
                    $pull: { matches: req.params.userID }
                }, function(err, result){
                    if(err){
                        res.send(err);
                    } else { 
                        console.log('added match!');
                        
                        User.findByIdAndUpdate({_id: req.params.userID},
                            {
                                $pull: { matches: req.userData.userId }
                            }, function(err, result){
                                if(err){
                                    res.send(err);
                                } else { 
                                    console.log('liked!');
                                    return res.redirect('/');
                                }
                            });
                        }
                    });
                }
            })
        });
        // Hvordan man liker en profil 
        router.post('/like/:userID', checkAuth, function(req, res, next) {
            
            User.findById(req.userData.userId)
            .exec()
            .then( user => {
                // Oprette en match ved at skrive user ID
                console.log(user.likes);
                if (user.likes.includes(req.params.userID)) {
                    console.log('create match');
                   
                    // Tilføje en match 
                    User.findByIdAndUpdate({_id: req.userData.userId},
                        {
                            $push: { matches: req.params.userID }
                        }, function(err, result){
                            if(err){
                                res.send(err);
                            } else { 
                                console.log('added match!');
                                // tilføje match til andre user
                                User.findByIdAndUpdate({_id: req.params.userID},
                                    {
                                        $push: { matches: req.userData.userId }
                                    }, function(err, result){
                                        if(err){
                                            res.send(err);
                                        } else { 
                                            console.log('liked!');
                                            // Tilføje userID til liked profil
                                            User.findByIdAndUpdate({_id: req.params.userID},
                                                {
                                                    $push: { likes: req.userData.userId }
                                                }, function(err, result){
                                                    if(err){
                                                        res.send(err);
                                                    } else { 
                                                        console.log('liked!');
                                                        const notification = new Notification({
                                                            _id: mongoose.Types.ObjectId(),
                                                            message: 'New Match!',
                                                            created_at: new Date(),
                                                            is_read: false,
                                                            owner_id: req.userData.userId                                                          
                                                        });
                                                        notification
                                                        .save()
                                                        .then(result => {
                                                            console.log(result);
                                                            return res.redirect('/');
                                                        })
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            } else {
 // Tilføje userID til liked profil
  User.findByIdAndUpdate({_id: req.params.userID},
 {
    $push: { likes: req.userData.userId }
  }, function(err, result){
                                        if(err){
                                            res.send(err);
                                        } else { 
                                            console.log('liked!');
                                            return res.redirect('/');
                                        }
                                    });
                                }
                                
                                
                            });
                            
                            
                        })
                        
                        // Dislike en user
                        router.post('/dislike/:userID', checkAuth,function(req, res, next) {
                            
                        // Tilføje userID til liked profil

                            User.findByIdAndUpdate({_id: req.params.userID},
                                {
                                    $push: { dislikes: req.userData.userId }
                                }, function(err, result){
                                    if(err){
                                        res.send(err);
                                    } else { 
                                        console.log('disliked!');
                                        res.redirect('/');
                                    }
                                });
                            })
                            
                            //Forside
                            router.get('/', checkAuth, function(req, res, next) {
                                User.findById(req.userData.userId)
                                .exec()
                                .then(user => {
                                    console.log(user.gender);
                                    if (user.gender === 'male') {
                                        User.find({
                                            gender: 'female',
                                            likes: { $nin: [req.userData.userId] },
                                            dislikes: { $nin: [req.userData.userId] },
                                            matches: { $nin: [req.userData.userId] }
                                        })
                                        .lean()
                                        .then(function(doc) {
                                            Notification
                                            .find({"owner_id": user._id, "is_read": {$ne: true}}).lean()
                                            .then( function(noti) {
                                                console.log(noti)
                                                return res.render('index', {users: doc, notifications: noti, time: Date(noti.created_at) });
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                return res.render('index', {users: doc});
                                            }) 
                                        })
                                
                                    };
                                    
                                    if (user.gender === 'female') {
                                        User.find({
                                            gender: 'male',
                                            // hvor brugeren ikke er blevet vist før 
                                            likes: { $nin: [req.userData.userId] },
                                            dislikes: { $nin: [req.userData.userId] },
                                            dislikes: { $nin: [req.userData.userId] }
                                        })
                                        .lean()
                                        .then(function(doc) {
                                            res.render('index', {users: doc});
                                        });
                                    };
                                })
                                .catch(err => {
                                    console.log(err);
                                })
              
                            });
                            
                            function prettyDate(date) {
                                time = date.toISOString()
                                var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
                                diff = (((new Date()).getTime() - date.getTime()) / 1000),
                                day_diff = Math.floor(diff / 86400);
                                
                                if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return;
                                
                                return day_diff == 0 && (
                                    diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff == 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
                                }
                                if (typeof jQuery != "undefined") jQuery.fn.prettyDate = function() {
                                    return this.each(function() {
                                        var date = prettyDate(this.title);
                                        if (date) jQuery(this).text(date);
                                    });
                                };
                                
module.exports = router;