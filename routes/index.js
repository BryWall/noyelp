var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
/* GET home page. */
router.get('/', function(req, res, next) {
  //La liste de tous les restaurants
  mongoose.model('Restaurant').find({}, (err, restaurants) => res.render('index', {restaurants}));
});

module.exports = router;
