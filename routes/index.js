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
  //Modifier un film
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
        restaurant._id = restaurant._id;
        return restaurant;
      })
      res.render('search', { restaurants })
    }
  });
});

router.post('/search', (req, res, next) => {
  return res.redirect('/search?name='+req.body.restaurant);
});


module.exports = router;
