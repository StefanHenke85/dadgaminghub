import { supabase } from '../config/supabase.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, banned } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filters
    if (search) {
      query = query.or(`username.ilike.%${search}%,name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (banned === 'true') {
      query = query.eq('is_banned', true);
    } else if (banned === 'false') {
      query = query.eq('is_banned', false);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      users: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Benutzer' });
  }
};

// Ban user
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Ban-Grund erforderlich' });
    }

    // Prevent banning other admins
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role, username, name')
      .eq('id', userId)
      .single();

    if (targetUser?.role === 'admin') {
      return res.status(403).json({ error: 'Admins können nicht gebannt werden' });
    }

    // Ban the user
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: reason,
        banned_by: req.userId
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({
      message: `Benutzer ${targetUser?.username} wurde gesperrt`,
      success: true
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Fehler beim Sperren des Benutzers' });
  }
};

// Unban user
export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_banned: false,
        banned_at: null,
        banned_reason: null,
        banned_by: null
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({
      message: 'Benutzer wurde entsperrt',
      success: true
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Fehler beim Entsperren des Benutzers' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting other admins
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Fetch user error:', fetchError);
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    if (targetUser?.role === 'admin') {
      return res.status(403).json({ error: 'Admins können nicht gelöscht werden' });
    }

    // Try to delete from auth.users first (this will cascade to profiles)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Auth delete error:', authError);
      // If auth delete fails, try to delete profile directly
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Profile delete error:', profileError);
        return res.status(500).json({
          error: 'Fehler beim Löschen des Benutzers',
          details: profileError.message
        });
      }
    }

    res.json({
      message: `Benutzer ${targetUser?.username} wurde gelöscht`,
      success: true
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Fehler beim Löschen des Benutzers',
      details: error.message
    });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Ungültige Rolle' });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;

    res.json({
      message: 'Benutzerrolle aktualisiert',
      success: true
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Rolle' });
  }
};

// Get admin logs - simplified version without admin_logs table
export const getAdminLogs = async (req, res) => {
  try {
    // Return empty logs for now since admin_logs table doesn't exist
    res.json({
      logs: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
      }
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Logs' });
  }
};

// Get dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Banned users
    const { count: bannedUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true);

    // Online users
    const { count: onlineUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('online', true);

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: newUsersToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Total sessions
    const { count: totalSessions } = await supabase
      .from('gaming_sessions')
      .select('*', { count: 'exact', head: true });

    res.json({
      totalUsers,
      bannedUsers,
      onlineUsers,
      newUsersToday,
      totalSessions
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
};
