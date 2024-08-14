var express = require('express');
var router = express.Router();

var folderController = require('../controllers/folder.js')

router.get('/:folderId', folderController.folder_get);

router.post('/:folderId', folderController.folder_post);

router.put('/:folderId', folderController.folder_update);

router.delete('/:folderId', folderController.folder_delete);

module.exports = router;
