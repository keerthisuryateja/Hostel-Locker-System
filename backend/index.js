const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const lockerRoutes = require('./src/routes/lockers');
const adminRoutes = require('./src/routes/admin');

// Routes
// app.use('/api/lockers', ClerkExpressRequireAuth(), lockerRoutes); // Add auth later
app.use('/api/lockers', lockerRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Hostel Locker System API is running');
});

// Start Server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
