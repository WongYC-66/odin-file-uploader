var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/sign-in', function(req, res, next) {
  res.send('testing')
});


module.exports = router;
