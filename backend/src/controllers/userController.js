import { supabase } from '../config/supabase.js';

export const getUsers = async (req, res) => {
  try {
    // Don't include the current user in the list
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', req.userId)
      .limit(50);

    const { data: users, error} = await query;

    if (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Benutzer' });
    }

    // Calculate online status based on last_seen (online if seen within last 5 minutes)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const enrichedUsers = users.map(user => {
      const lastSeen = user.last_seen ? new Date(user.last_seen) : null;
      const isOnline = lastSeen && lastSeen > fiveMinutesAgo;

      return {
        ...user,
        online: isOnline
      };
    });

    res.json(enrichedUsers);
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
    const { id: recipientId } = req.params;
    const { message } = req.body;

    // Prüfe ob bereits eine Anfrage existiert
    const { data: existing } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`and(sender_id.eq.${req.userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${req.userId})`)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'Anfrage existiert bereits' });
    }

    // Prüfe ob bereits befreundet
    const { data: friendship } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', req.userId)
      .eq('friend_id', recipientId)
      .maybeSingle();

    if (friendship) {
      return res.status(400).json({ error: 'Ihr seid bereits befreundet' });
    }

    // Erstelle Anfrage
    const { data: request, error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: req.userId,
        recipient_id: recipientId,
        message: message || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Send friend request error:', error);
      return res.status(500).json({ error: 'Fehler beim Senden der Anfrage' });
    }

    res.status(201).json({ message: 'Freundschaftsanfrage gesendet', request });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Fehler beim Senden der Anfrage' });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;

    // Hole Anfrage
    const { data: request, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .eq('recipient_id', req.userId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Anfrage nicht gefunden' });
    }

    // Update Anfrage Status
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) {
      console.error('Update request error:', updateError);
      return res.status(500).json({ error: 'Fehler beim Akzeptieren' });
    }

    // Erstelle Freundschaft
    const { error: friendError } = await supabase
      .from('friends')
      .insert({
        user_id: req.userId,
        friend_id: request.sender_id
      });

    if (friendError) {
      console.error('Create friendship error:', friendError);
      return res.status(500).json({ error: 'Fehler beim Erstellen der Freundschaft' });
    }

    res.json({ message: 'Anfrage akzeptiert' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Fehler beim Akzeptieren der Anfrage' });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;

    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('recipient_id', req.userId);

    if (error) {
      console.error('Decline request error:', error);
      return res.status(500).json({ error: 'Fehler beim Ablehnen' });
    }

    res.json({ message: 'Anfrage abgelehnt' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Fehler beim Ablehnen der Anfrage' });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { id: friendId } = req.params;

    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', req.userId)
      .eq('friend_id', friendId);

    if (error) {
      console.error('Remove friend error:', error);
      return res.status(500).json({ error: 'Fehler beim Entfernen' });
    }

    res.json({ message: 'Freund entfernt' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Fehler beim Entfernen' });
  }
};

export const getFriends = async (req, res) => {
  try {
    const { data: friendships, error } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', req.userId);

    if (error) {
      console.error('Get friends error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Freunde' });
    }

    const friendIds = friendships.map(f => f.friend_id);

    if (friendIds.length === 0) {
      return res.json([]);
    }

    const { data: friends, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', friendIds);

    if (profileError) {
      console.error('Get friend profiles error:', profileError);
      return res.status(500).json({ error: 'Fehler beim Laden der Profile' });
    }

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Freunde' });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('recipient_id', req.userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get friend requests error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Anfragen' });
    }

    // Hole Sender-Profile
    if (requests.length > 0) {
      const senderIds = requests.map(r => r.sender_id);
      const { data: senders } = await supabase
        .from('profiles')
        .select('id, username, name, avatar')
        .in('id', senderIds);

      // Mappe Sender zu Requests
      const requestsWithSender = requests.map(req => ({
        ...req,
        sender: senders?.find(s => s.id === req.sender_id)
      }));

      return res.json(requestsWithSender);
    }

    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Anfragen' });
  }
};

export const updateOnlineStatus = async (req, res) => {
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
