var express = require('express');
var router = express.Router();

var filesController = require('../controllers/files.js')
const multer = require('multer')
const upload = multer({ dest: './uploads/' })

// router.get('/sign-in', usersController.sign_in_get);

router.post('/home', filesController.home_post);

// router.get('/sign-up', usersController.sign_up_get);

// router.post('/sign-up', usersController.sign_up_post);

// router.get('/sign-out', usersController.sign_out_get);

module.exports = router;
