const { PrismaClient } = require('@prisma/client')
const { body, validationResult } = require("express-validator");
// const asyncHandler = require("express-async-handler");
const passport = require('passport')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

exports.sign_in_get = (req, res, next) => {
    // console.log(req.session)
    // req.session.messages from passport
    const extractedMessages = req.session.messages
    req.session.messages = []

    res.render('sign-in', { errors: extractedMessages })
}

// passport , with logged in store at prisma session
exports.sign_in_post = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/sign-in",
    failureMessage: true,
})

exports.sign_up_get = (req, res, next) => {
    res.render('sign-up');
}

exports.sign_up_post = [
    // Validate and sanitize fields.
    body("password")
        .custom((value, { req }) => {
            return value === req.body.confirmPassword;
        })
        .withMessage('password does not match confirm password')
        .escape(),
    body("username")
        .custom(async (value, { req }) => {
            let hasUser = await prisma.user.findFirst({
                where: {
                    username: req.body.username
                }
            })
            if (hasUser) throw new Error()
            return true
        })
        .withMessage('username has been used')
        .escape(),

    async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // console.log(errors.array())

        let user = {
            username: req.body.username,
        }

        // There are errors. Render form again with sanitized values/error messages.
        if (!errors.isEmpty()) {
            res.render('sign-up', {
                user: user,
                errors: errors.array()
            });
        } else {
            // no error, create new record in database
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);

            user = {
                ...user,
                password: hashedPassword
            }

            const createUser = await prisma.user.create({ data: user })
            // console.log(createUser)
            res.redirect('/users/sign-in')
        }
    }
]

exports.sign_out_get = (req, res, next) => {
    // passport sign ut
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
}