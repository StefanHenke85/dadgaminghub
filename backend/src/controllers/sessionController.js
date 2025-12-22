import { supabase } from '../config/supabase.js';

export const createSession = async (req, res) => {
  try {
    const { game, platform, maxPlayers, scheduledFor, description } = req.body;

    const { data: session, error } = await supabase
      .from('gaming_sessions')
      .insert({
        game,
        platform,
        max_players: maxPlayers || 4,
        scheduled_at: scheduledFor,
        description: description || '',
        host_id: req.userId,
        participants: [req.userId]
      })
      .select()
      .single();

    if (error) {
      console.error('Create session error:', error);
      return res.status(500).json({ error: 'Fehler beim Erstellen der Session' });
    }

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Serverfehler beim Erstellen der Session' });
  }
};

export const getSessions = async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('gaming_sessions')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Get sessions error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Sessions' });
    }

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden der Sessions' });
  }
};

export const joinSession = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: session, error: fetchError } = await supabase
      .from('gaming_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    if (session.participants.includes(req.userId)) {
      return res.status(400).json({ error: 'Du bist bereits dabei' });
    }

    if (session.participants.length >= session.max_players) {
      return res.status(400).json({ error: 'Session ist voll' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('gaming_sessions')
      .update({
        participants: [...session.participants, req.userId]
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Join session error:', updateError);
      return res.status(500).json({ error: 'Fehler beim Beitreten' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Serverfehler beim Beitreten' });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: session, error: fetchError } = await supabase
      .from('gaming_sessions')
      .select('host_id')
      .eq('id', id)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    if (session.host_id !== req.userId) {
      return res.status(403).json({ error: 'Nur der Host kann die Session löschen' });
    }

    const { error: deleteError } = await supabase
      .from('gaming_sessions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete session error:', deleteError);
      return res.status(500).json({ error: 'Fehler beim Löschen' });
    }

    res.json({ message: 'Session gelöscht' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Serverfehler beim Löschen' });
  }
};
