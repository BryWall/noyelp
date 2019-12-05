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


router.get('/search', (req, res) => {
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
                  function_score: {
                      query: {
                          match: {
                              'neighborhood.ngram': {
                                  query: req.query.neighborhood,
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
                  function_score: {
                      query: {
                          match: {
                              'location.ngram': {
                                  query: req.query.location,
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
                          'operator': 'or',
                          'boost': 5.0,
                      }
                  }
              },
              {
                match: {
                    'neighborhood.keyword': {
                        'query': req.query.neighborhood,
                        'operator': 'or',
                        'boost': 5.0,
                    }
                }
              },
              {
                  match: {
                      'location.keyword': {
                          'query': req.query.location,
                          'operator': 'or',
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
              return restaurant;
          });
          res.render('search', {restaurants})
      }
  });
});

router.post('/search', (req, res) => {
  console.log(req.body);

  let request = {
    multi_match: {
      query: req.body.name,
      fields: [
        'name.ngram',
        'name.keyword',
        'neighborhood.ngram',
        'neighborhood.keyword',
        'location.ngram',
        'location.keyword'
      ],
      fuzziness : 'AUTO'
    },
  };

  mongoose.model('Restaurant').search(request, (err, items) => {
    console.log(items)
    const restaurants = items.hits.hits.map(item => {
      const restaurant = item._source;
      restaurant._id = item._id;
      restaurant._score = item._score;
      return restaurant;
    })
    res.render('search', { restaurants })
  })

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
  //Modifier un meal
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


router.post('/meal/search/:id', (req, res, next) => {
  let request = {
    multi_match: {
      query: req.body.meal,
      fields: [
        'name.ngram',
        'name.keyword',
        'allergies.ngram',
        'allergies.keyword',
        'ingredients.ngram',
        'ingredients.keyword'
      ],
      fuzziness : 'AUTO'
    },
  };

  mongoose.model('Meal').search(request, (err, items) => {
    if (!err && items) {
      const meals = [];
      items.hits.hits.forEach(item => {
        const meal = item._source;
        if(req.params.id == meal.restaurant_id){
          meal._id = item._id;
          console.log(meal);
          meals.push(meal);
        }
      })
      res.render('meals/search', { meals, restaurant_id : req.params.id })
    }
    else {
      console.log("error in search");
    }
  });
});


module.exports = router;
