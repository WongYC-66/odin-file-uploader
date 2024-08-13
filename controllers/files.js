const { body, validationResult } = require("express-validator");
// const asyncHandler = require("express-async-handler");
const passport = require('passport')
const bcrypt = require('bcrypt')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

exports.home_post = [
    upload.array('uploaded', 100),
    async (req, res, next) => {
        console.log(req.files)
        res.send('File uploaded successfully!');
    }
]