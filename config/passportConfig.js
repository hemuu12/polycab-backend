// const passport = require('passport');
// const { Strategy } = require('passport-saml');
// const { userModel } = require('../models/user.model');
// require('dotenv').config();

// passport.use(new Strategy({
//   entryPoint: process.env.SAML_ENTRY_POINT,
//   // issuer: process.env.SAML_ISSUER,
//   callbackUrl: process.env.SAML_CALLBACK_URL,
//   cert: 'your_certificate',
// },async (profile, done) => {
//   try {
//     // Check if the user already exists in the database
//     let user = await userModel.findOne({ email: profile.email });

//     if (!user) {
//       user = new userModel({
//         name: profile.name,
//         email: profile.email,
//         factoryAccess: [] 
//       });
//       await user.save();
//     }

//     return done(null, user);
//   } catch (err) {
//     console.error(err);
//     return done(err);
//   }
// }));

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// module.exports = passport;
