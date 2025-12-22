import { supabase } from '../config/supabase.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, banned } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select(`
        *,
        banned_by_profile:profiles!profiles_banned_by_fkey(username, name)
      `, { count: 'exact' })
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

    // Log the action
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: req.userId,
        action: 'ban_user',
        target_user_id: userId,
        details: { reason }
      });

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

    // Log the action
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: req.userId,
        action: 'unban_user',
        target_user_id: userId
      });

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
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role, username')
      .eq('id', userId)
      .single();

    if (targetUser?.role === 'admin') {
      return res.status(403).json({ error: 'Admins können nicht gelöscht werden' });
    }

    // Log before deletion
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: req.userId,
        action: 'delete_user',
        target_user_id: userId,
        details: { username: targetUser?.username }
      });

    // Delete from auth.users (cascades to profiles)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    res.json({
      message: `Benutzer ${targetUser?.username} wurde gelöscht`,
      success: true
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Benutzers' });
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

    // Log the action
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: req.userId,
        action: 'update_role',
        target_user_id: userId,
        details: { new_role: role }
      });

    res.json({
      message: 'Benutzerrolle aktualisiert',
      success: true
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Rolle' });
  }
};

// Get admin logs
export const getAdminLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, adminId } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('admin_logs')
      .select(`
        *,
        admin:profiles!admin_logs_admin_id_fkey(username, name),
        target:profiles!admin_logs_target_user_id_fkey(username, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) {
      query = query.eq('action', action);
    }

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      logs: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
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
