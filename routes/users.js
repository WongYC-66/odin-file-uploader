var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/')
});

router.get('/sign-in', function(req, res, next) {
  res.render('sign-in');
});

router.get('/sign-out', function(req, res, next) {
  // req.user.logoff? passport logoff?
  res.send('logging off user');
});

router.get('/sign-up', function(req, res, next) {
  res.render('sign-up');
});


module.exports = router;
