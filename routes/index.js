var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/* GET home page. */
router.get('/', async (req, res, next) => {
  // console.log(req.user)
  if (!req.user) {
    res.render('index');
    return
  }
  // console.log(req.user)

  // get folder list inside MainFolder
  const {subFolders} = await prisma.mainFolder.findUnique({
    where: {
      id: req.user.mainFolderId
    },
    select: {
      subFolders: true
    }
  })
  // console.log(subFolders)
  // get file list inside MainFolder
  const files = await prisma.file.findMany({
    where: {
      mainFolderId: req.user.mainFolderId
    }
  })
  // console.log(files)
  
  res.render('index', { 
    user: req.user, 
    subFolders, 
    files, 
    folderName: 'Home',
    folderId: 'master'
  });

});


module.exports = router;
