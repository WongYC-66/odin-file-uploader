const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt')
// 
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const customFields = {
    usernameField: 'username',
    passwordField: 'password',
}

const verifyCallback = async (username, password, done) => {
    console.log('try to log in ', username, password)

    try {
        const user = await prisma.user.findFirst({
            where: {
                username: username
            }
        })
        // console.log(user)

        if (!user) {
            // console.log("incorrect username")
            return done(null, false, { message: "Incorrect username" });
        };

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            // passwords do not match!
            // console.log("incorrect password")

            return done(null, false, { message: "Incorrect password" })
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    };
}

const strategy = new LocalStrategy(customFields, verifyCallback)
passport.use(strategy)


passport.serializeUser((user, done) => {
    done(null, user.username);
});
// Function three : serialization
passport.deserializeUser(async (username, done) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                username: username
            }
        })
        done(null, user);
    } catch (err) {
        done(err);
    };
});