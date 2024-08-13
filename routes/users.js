var express = require('express');
var router = express.Router();

var usersController = require('../controllers/users.js')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/')
});

router.get('/sign-in', usersController.sign_in_get);

router.post('/sign-in', usersController.sign_in_post);

router.get('/sign-up', usersController.sign_up_get);

router.post('/sign-up', usersController.sign_up_post);

router.get('/sign-out', usersController.sign_out_get);

module.exports = router;
