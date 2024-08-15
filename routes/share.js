var express = require('express');
var router = express.Router();

var shareController = require('../controllers/share.js')

router.get('/', function(req, res, next) {
  res.redirect('/')
});

router.post('/get-link', shareController.link_post);

router.get('/folder/:linkId/', shareController.folder_get);
router.get('/folder/:linkId/:folderId', shareController.folder_get);

router.get('/files/:linkId/:fileId', shareController.file_get);

module.exports = router;
