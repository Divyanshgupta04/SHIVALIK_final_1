const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ ERROR: Missing Google OAuth credentials in .env file');
    console.error('Required variables:');
    console.error('  - GOOGLE_CLIENT_ID');
    console.error('  - GOOGLE_CLIENT_SECRET');
    console.error('\nPlease check your .env file in the backend directory.');
    process.exit(1);
}

console.log('✅ Google OAuth credentials loaded successfully');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // User exists, return user
                return done(null, user);
            }

            // Check if user exists with this email
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // User exists with this email, link Google account
                user.googleId = profile.id;
                user.isVerified = true;
                await user.save();
                return done(null, user);
            }

            // Create new user
            const newUser = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                isVerified: true,
                lastLogin: new Date()
            });

            await newUser.save();
            return done(null, newUser);

        } catch (error) {
            console.error('Google OAuth error:', error);
            return done(error, null);
        }
    }
));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
