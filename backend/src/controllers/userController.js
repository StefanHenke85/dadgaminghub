import { supabase } from '../config/supabase.js';

export const getUsers = async (req, res) => {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .limit(50);

    const { data: users, error} = await query;

    if (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Benutzer' });
    }

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden der Benutzer' });
  }
};

export const getUser = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Benutzers' });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    res.json({ message: 'Freundschaftsanfrage gesendet' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Fehler beim Senden der Anfrage' });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    res.json({ message: 'Anfrage akzeptiert' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Fehler beim Akzeptieren der Anfrage' });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    res.json({ message: 'Anfrage abgelehnt' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Fehler beim Ablehnen der Anfrage' });
  }
};

export const removeFriend = async (req, res) => {
  try {
    res.json({ message: 'Freund entfernt' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Fehler beim Entfernen' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { online, currentActivity } = req.body;

    const { error } = await supabase
      .from('profiles')
      .update({
        online: online !== undefined ? online : true,
        current_activity: currentActivity || 'Online'
      })
      .eq('id', req.userId);

    if (error) {
      console.error('Update status error:', error);
      return res.status(500).json({ error: 'Fehler beim Aktualisieren des Status' });
    }

    res.json({ message: 'Status aktualisiert' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Status' });
  }
};
