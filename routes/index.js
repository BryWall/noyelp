var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
/* GET home page. */
router.get('/', function(req, res, next) {
  //La liste de tous les restaurants
  mongoose.model('Restaurant').find({}, (err, restaurants) => res.render('index', {restaurants}));
});

router.get('/create', (req, res, next) => {
  res.render('create');
});

router.post('/create', (req, res, next) => {
  const restaurant = req.body;
  mongoose.model('Restaurant').create(restaurant,(err, item) => {
    if(!err){
      return res.redirect('/');
    }
    console.log(err);
    res.send(err);
  })
});


module.exports = router;
