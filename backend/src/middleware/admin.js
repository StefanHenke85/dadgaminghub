import { supabase } from '../config/supabase.js';

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Nicht authentifiziert' });
    }

    // Check if user is admin
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return res.status(500).json({ error: 'Fehler beim Prüfen der Berechtigung' });
    }

    if (profile.role !== 'admin' && profile.role !== 'moderator') {
      return res.status(403).json({ error: 'Keine Admin-Berechtigung' });
    }

    req.userRole = profile.role;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
};

export const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Nicht authentifiziert' });
    }

    // Check if user is super admin
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.userId)
      .single();

    if (error) {
      console.error('Error checking super admin status:', error);
      return res.status(500).json({ error: 'Fehler beim Prüfen der Berechtigung' });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ error: 'Nur für Admins' });
    }

    req.userRole = profile.role;
    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
};
