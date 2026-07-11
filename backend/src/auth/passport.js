import passport from "passport";
import googleOAuth20 from "passport-google-oauth20";
const { Strategy: GoogleStrategy } = googleOAuth20;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // return done(null, profile);
        return done(null, {
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails,
          photos: profile.photos,
        });
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

export default passport;
