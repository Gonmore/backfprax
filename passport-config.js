// passport-config.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {Strategy as FacebookStrategy } from'passport-facebook';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import {User} from './src/models/users.js'

// Serializar y deserializar el usuario para las sesiones
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

const secret = process.env.JWT_SECRET
// Configuración JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
};
passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await User.findByPk(jwtPayload.id);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
}));


passport.use(new GoogleStrategy({
    clientID: process.env.google_client_id,
    clientSecret: process.env.google_client_secret,
    callbackURL: 'http://localhost:3001/auth/google/callback',
    scope: 'https://www.googleapis.com/auth/userinfo.email',
  },
  async (token, tokenSecret, profile, done) => {
    try {
      let user = await User.findOne({ where: { googleId: profile.id } });
      if (!user) {
        //user = await User.create({ googleId: profile.id, username: profile.displayName, image:profile.photos[0].value, email: profile.emails[0].value });
        user = await User.create({ googleId: profile.id, username: profile.displayName, image:profile.photos[0].value});
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
}));

passport.use(new FacebookStrategy({
    clientID: process.env.facebook_client_id,
    clientSecret: process.env.facebook_client_secret,
    callbackURL: 'http://localhost:3001/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email', 'photos'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ where: { facebookId: profile.id } });
      if (!user) {
        user = await User.create({ facebookId: profile.id, username: profile.displayName,image:profile.photos[0].value, email: profile.emails[0].value });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
}));



export default passport;
