import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleOAuthLogin } from '../services/auth.service';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3000/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('NO_EMAIL'));
        const result = await googleOAuthLogin(profile.id, email, profile.displayName);
        done(null, result);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

export { passport };
