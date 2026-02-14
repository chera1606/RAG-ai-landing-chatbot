import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../module/auth/auth.model.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("🔥 Passport Callback Triggered");
                console.log("Profile ID:", profile.id);
                console.log("Profile Email:", profile.emails?.[0]?.value);

                // Check if user exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    console.log("✅ User found by Google ID:", user.email);
                    return done(null, user);
                }

                // Check if user exists with same email
                user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    console.log("🔗 Linking account for:", user.email);
                    // Link accounts
                    user.googleId = profile.id;
                    await user.save();
                    return done(null, user);
                }

                console.log("🆕 Creating NEW user for:", profile.emails[0].value);
                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    role: "user",
                });
                console.log("✅ New user created successfully");

                return done(null, user);
            } catch (err) {
                console.error("❌ Passport Error:", err);
                return done(err, null);
            }
        }
    )
);

// We don't need sessions if using JWT, but Passport might need serialization if sessions are enabled.
// Since we are generating JWT manually in controller, we might not strictly need this if session: false
// But common setup includes it.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
