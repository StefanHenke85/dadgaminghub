import { supabase, supabaseAuth } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, name, age, kids } = req.body;

    // Check if username already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingProfile) {
      return res.status(400).json({
        error: 'Benutzername bereits vergeben'
      });
    }

    // Create auth user in Supabase with email confirmation
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          name,
          age,
          kids: kids || 0
        },
        emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        error: authError.message === 'User already registered'
          ? 'E-Mail bereits registriert'
          : authError.message
      });
    }

    // Create profile directly (don't rely on trigger)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        name,
        age: age || null,
        kids: kids || 0,
        role: 'user',
        online: false,
        current_activity: 'Offline'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // If profile already exists, update it instead
      await supabase
        .from('profiles')
        .update({
          username,
          name,
          age: age || null,
          kids: kids || 0
        })
        .eq('id', authData.user.id);
    }

    res.status(201).json({
      message: 'Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse, um dich anzumelden.',
      emailConfirmationRequired: true,
      email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Serverfehler bei der Registrierung' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase (use anon client for auth)
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Get user profile with role and ban status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Fehler beim Laden des Profils' });
    }

    // Check if user is banned
    if (profile.is_banned) {
      return res.status(403).json({
        error: 'Dein Account wurde gesperrt',
        banned: true,
        reason: profile.banned_reason,
        banned_at: profile.banned_at
      });
    }

    // Update online status and last_seen
    await supabase
      .from('profiles')
      .update({
        online: true,
        current_activity: 'Online',
        last_seen: new Date().toISOString()
      })
      .eq('id', authData.user.id);

    // Generate our own JWT token
    const token = generateToken(authData.user.id);

    res.json({
      message: 'Anmeldung erfolgreich',
      token,
      user: {
        id: profile.id,
        username: profile.username,
        email: authData.user.email,
        name: profile.name,
        online: true,
        role: profile.role || 'user',
        avatar: profile.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Serverfehler bei der Anmeldung' });
  }
};

export const logout = async (req, res) => {
  try {
    // Update online status
    await supabase
      .from('profiles')
      .update({
        online: false,
        current_activity: 'Offline'
      })
      .eq('id', req.userId);

    res.json({ message: 'Erfolgreich abgemeldet' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Serverfehler bei der Abmeldung' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Get auth user email
    const { data: authUser } = await supabase.auth.admin.getUserById(req.userId);

    res.json({
      ...profile,
      email: authUser?.user?.email
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden des Profils' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'age', 'kids', 'platforms', 'games',
      'availability', 'time_preference', 'contacts', 'bio', 'avatar'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Keine gültigen Aktualisierungen' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }

    res.json({
      message: 'Profil erfolgreich aktualisiert',
      user: data
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Profils' });
  }
};
