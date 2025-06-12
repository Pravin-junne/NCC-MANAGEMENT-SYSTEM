const LocalStrategy = require("passport-local").Strategy;
const Admin = require("../models/admin");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" }, // Use "email" instead of the default "username"
      async (email, password, done) => {
        try {
          const admin = await Admin.findOne({ email });
          if (!admin) {
            return done(null, false, { message: "Admin not found!" });
          }
          const isMatch = await admin.isValidPassword(password);
          if (!isMatch) {
            return done(null, false, { message: "Incorrect password!" });
          }
          return done(null, admin);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((admin, done) => {
    done(null, admin.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const admin = await Admin.findById(id);
      done(null, admin);
    } catch (err) {
      done(err);
    }
  });
};
