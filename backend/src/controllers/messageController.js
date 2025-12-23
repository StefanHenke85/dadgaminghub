import { supabase } from '../config/supabase.js';

export const sendMessage = async (req, res) => {
  try {
    const { recipient, content, sessionId } = req.body;

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: req.userId,
        recipient_id: recipient || null,
        session_id: sessionId || null,
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Send message error:', error);
      return res.status(500).json({ error: 'Fehler beim Senden der Nachricht' });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Serverfehler beim Senden der Nachricht' });
  }
};

export const getConversations = async (req, res) => {
  try {
    // Get all unique conversation partners
    const { data: messages, error } = await supabase
      .from('messages')
      .select('sender_id, recipient_id, content, created_at')
      .or(`sender_id.eq.${req.userId},recipient_id.eq.${req.userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get conversations error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Konversationen' });
    }

    // Group by conversation partner
    const conversationMap = new Map();

    for (const msg of messages) {
      const partnerId = msg.sender_id === req.userId ? msg.recipient_id : msg.sender_id;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at
        });
      }
    }

    // Fetch user details for each conversation partner
    const conversations = [];
    for (const [partnerId, convData] of conversationMap) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, username, avatar, online')
        .eq('id', partnerId)
        .single();

      if (profile) {
        // Count unread messages
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', partnerId)
          .eq('recipient_id', req.userId)
          .eq('read', false);

        conversations.push({
          user: {
            _id: profile.id,
            id: profile.id,
            name: profile.name,
            username: profile.username,
            avatar: profile.avatar,
            online: profile.online
          },
          lastMessage: convData.lastMessage,
          lastMessageTime: convData.lastMessageTime,
          unreadCount: count || 0
        });
      }
    }

    // Sort by last message time
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden der Konversationen' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${req.userId},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${req.userId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get conversation error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Konversation' });
    }

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden der Konversation' });
  }
};

export const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get session messages error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Nachrichten' });
    }

    res.json(messages);
  } catch (error) {
    console.error('Get session messages error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden der Nachrichten' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', userId)
      .eq('recipient_id', req.userId);

    if (error) {
      console.error('Mark as read error:', error);
      return res.status(500).json({ error: 'Fehler beim Markieren' });
    }

    res.json({ message: 'Als gelesen markiert' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Serverfehler beim Markieren' });
  }
};
