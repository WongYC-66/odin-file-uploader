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
  const userId = req.user.id

  // get folder list inside homeFolder
  const {folders} = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      folders: {
        where: {
          parentId: {
            equals: null
          }
        }
      }
    }
  })
  console.log(folders)
  // get file list inside homeFolder

  res.render('index', { user: req.user });

});


module.exports = router;
