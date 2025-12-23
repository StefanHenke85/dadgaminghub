import { supabase } from '../config/supabase.js';

export const getNotifications = async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Get notifications error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Benachrichtigungen' });
    }

    res.json(notifications || []);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Benachrichtigungen' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', req.userId);

    if (error) {
      console.error('Mark as read error:', error);
      return res.status(500).json({ error: 'Fehler beim Markieren der Benachrichtigung' });
    }

    res.json({ message: 'Benachrichtigung als gelesen markiert' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Fehler beim Markieren der Benachrichtigung' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', req.userId)
      .eq('read', false);

    if (error) {
      console.error('Mark all as read error:', error);
      return res.status(500).json({ error: 'Fehler beim Markieren der Benachrichtigungen' });
    }

    res.json({ message: 'Alle Benachrichtigungen als gelesen markiert' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Fehler beim Markieren der Benachrichtigungen' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('recipient_id', req.userId);

    if (error) {
      console.error('Delete notification error:', error);
      return res.status(500).json({ error: 'Fehler beim Löschen der Benachrichtigung' });
    }

    res.json({ message: 'Benachrichtigung gelöscht' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Benachrichtigung' });
  }
};
