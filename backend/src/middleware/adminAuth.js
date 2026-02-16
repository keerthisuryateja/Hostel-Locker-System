const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { createClient } = require('@supabase/supabase-js');
// We need the full Clerk client to fetch user details (emails) from the user ID
const clerksdk = require('@clerk/clerk-sdk-node');

require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Basic Clerk Authentication Middleware
const requireAuth = ClerkExpressRequireAuth();

// 2. Admin Verification Middleware
const requireAdmin = async (req, res, next) => {
    try {
        // req.auth is populated by ClerkExpressRequireAuth
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = req.auth.userId;

        // Fetch user details from Clerk to get email
        const user = await clerksdk.users.getUser(userId);
        const userEmail = user.emailAddresses[0]?.emailAddress;

        if (!userEmail) {
            return res.status(403).json({ error: 'No email found for user' });
        }

        // Check against Supabase whitelist
        const { data: whitelistEntry, error } = await supabase
            .from('admin_whitelist')
            .select('email')
            .eq('email', userEmail)
            .maybeSingle();

        if (error) {
            console.error('Supabase error checking admin whitelist:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!whitelistEntry) {
            return res.status(403).json({ error: 'Access Denied: Not an allowed admin.' });
        }

        // User is authorized
        req.userEmail = userEmail;
        next();

    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ error: 'Internal Server Error during authorization' });
    }
};

module.exports = { requireAuth, requireAdmin };
