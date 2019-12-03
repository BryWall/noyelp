var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
/* GET home page. */

router.get('restaurant/:id', function(req, res, next) {
  //La liste de tous les restaurants
  mongoose.model('Restaurant').findById(req.params.id, (err, restaurant) => {
    mongoose.model('Meal').find({}, (err, meals) => {
        res.render('index', {restaurant, meals})
    })
  })
});



module.exports = router;
