var express = require('express');
var router = express.Router();

var filesController = require('../controllers/files.js')
const multer = require('multer')
const upload = multer({ dest: './uploads/' })

router.get('/:fileId', filesController.file_get);

router.post('/:folderId', filesController.files_post);

module.exports = router;
