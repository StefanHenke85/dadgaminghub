import express from 'express';
import { supabase, supabaseAuth } from '../config/supabase.js';

const router = express.Router();

// Test-Endpoint um ALLES zu debuggen
router.post('/login-debug', async (req, res) => {
  const { email, password } = req.body;
  const results = {
    step1_auth: null,
    step2_profile: null,
    step3_direct_query: null,
    errors: []
  };

  try {
    // Step 1: Supabase Auth
    console.log('🔍 Step 1: Trying auth with email:', email);
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      results.step1_auth = { error: authError.message };
      results.errors.push('Auth failed: ' + authError.message);
    } else {
      results.step1_auth = {
        success: true,
        userId: authData.user.id,
        email: authData.user.email
      };

      // Step 2: Try to get profile with service role
      console.log('🔍 Step 2: Fetching profile for user:', authData.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        results.step2_profile = { error: profileError };
        results.errors.push('Profile fetch failed: ' + profileError.message);
      } else {
        results.step2_profile = { success: true, profile };
      }

      // Step 3: Direct SQL query to double-check
      console.log('🔍 Step 3: Direct query for profile');
      const { data: directProfile, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id);

      if (directError) {
        results.step3_direct_query = { error: directError };
      } else {
        results.step3_direct_query = {
          success: true,
          count: directProfile.length,
          profiles: directProfile
        };
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      results
    });
  }
});

export default router;
