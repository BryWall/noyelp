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

router.get('/delete/:id', (req, res, next) => {
  mongoose.model('Restaurant').findById(req.params.id, (err, restaurant) => {
    res.render('delete', {restaurant})
  });
});

router.post('/delete/:id', (req, res, next) => {
  mongoose.model('Restaurant').findByIdAndDelete(req.params.id, (err, restaurant) => {
    if(err)
      return res.send(err);
    res.redirect('/');
  });
});

router.get('/edit/:id', (req, res, next) => {
  //Modifier un restaurant
  mongoose.model('Restaurant').findById(req.params.id, (err, restaurant) => {
    if (err)
      return res.send(err);

    res.render('edit', { restaurant });
  });
});

router.post('/edit/:id', (req, res, next) => {
  const restaurant = req.body;
  mongoose.model('Restaurant').findByIdAndUpdate(req.params.id, restaurant, (err, restaurant) => {
    if (err)
      return res.send(err);
    res.redirect('/');
  })
});


router.get('/search', (req, res, next) => {
  mongoose.model('Restaurant').search({
    dis_max: {
      queries: [
        {
          function_score: {
            query: {
              match: {
                'name.ngram': {
                  query: req.query.name,
                  fuzziness: 'AUTO'
                }
              }
            },
            script_score: {
              script: '_score * 0.7'
            }
          }
        },
        {
          match: {
            'name.keyword': {
              'query': req.query.name,
              'operator' : 'or',
              'boost': 5.0,
            }
          }
        }
      ]
    }
  }, (err, items) => {
    if (!err && items) {
      const restaurants = items.hits.hits.map(item => {
        const restaurant = item._source;
        restaurant._id = item._id;
        restaurant._score = item._score;
        console.log(restaurant);
        return restaurant;
      })
      res.render('search', { restaurants })
    }
    else {
      console.log("error in search");
    }
  });
});

router.post('/search', (req, res, next) => {
  return res.redirect('/search?name='+req.body.restaurant);
});

router.get('/restaurant/:id', function(req, res, next) {
  //La liste de tous les restaurants
  mongoose.model('Restaurant').findById(req.params.id, (err, restaurant) => {
    mongoose.model('Meal').find({restaurant_id : req.params.id}, (err, meals) => {
        res.render('meals/index', {restaurant, meals, restaurant_id : req.params.id})
    })
  })
});

router.get('/meal/create/:id', (req, res, next) => {
  res.render('meals/create',{restaurant_id : req.params.id});
});

router.post('/meal/create/:id', (req, res, next) => {
  const meal = req.body;
  meal.restaurant_id = req.params.id;
  meal.allergies = meal.allergies.split(',');
  meal.ingredients = meal.ingredients.split(',');
  meal.vegan = meal.vegan === 'on';
  meal.halal = meal.halal === 'on';
  meal.kosher = meal.kosher === 'on';
  mongoose.model('Meal').create(meal,(err, item) => {
    if(!err){
      return res.redirect('/restaurant/'+req.params.id);
    }
    console.log(err);
    res.send(err);
  })
});

router.get('/meal/delete/:id', (req, res, next) => {
  mongoose.model('Meal').findById(req.params.id, (err, meal) => {
    res.render('meals/delete', {meal, restaurant_id : meal.restaurant_id})
  });
});

router.post('/meal/delete/:id', (req, res, next) => {
  mongoose.model('Meal').findByIdAndDelete(req.params.id, (err, meal) => {
    if(err)
      return res.send(err);
    res.redirect('/restaurant/'+meal.restaurant_id);
  });
});

router.get('/meal/edit/:id', (req, res, next) => {
  //Modifier un film
  mongoose.model('Meal').findById(req.params.id, (err, meal) => {
    if (err)
      return res.send(err);

    res.render('meals/edit', { meal, restaurant_id: meal.restaurant_id });
  });
});

router.post('/meal/edit/:id', (req, res, next) => {
  const meal = req.body;
  meal.allergies = meal.allergies.split(',');
  meal.ingredients = meal.ingredients.split(',');
  meal.vegan = meal.vegan === 'on';
  meal.halal = meal.halal === 'on';
  meal.kosher = meal.kosher === 'on';
  mongoose.model('Meal').findByIdAndUpdate(req.params.id, meal, (err, meal) => {
    if (err)
      return res.send(err);
    res.redirect('/restaurant/'+meal.restaurant_id);
  })
});

module.exports = router;
