import { supabase } from '../config/supabase.js';
import axios from 'axios';

// Discord Webhook Funktion
const sendDiscordNotification = async (session, hostName, discordWebhookUrl) => {
  if (!discordWebhookUrl) return;

  try {
    const scheduledDate = new Date(session.scheduled_for);
    const embed = {
      embeds: [{
        title: `🎮 Neue Gaming Session: ${session.game}`,
        description: session.description || 'Komm und zock mit!',
        color: 5814783, // Indigo color
        fields: [
          {
            name: '🎯 Platform',
            value: session.platform,
            inline: true
          },
          {
            name: '👑 Host',
            value: hostName,
            inline: true
          },
          {
            name: '👥 Spieler',
            value: `1/${session.max_players}`,
            inline: true
          },
          {
            name: '📅 Wann',
            value: scheduledDate.toLocaleString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            inline: false
          },
          {
            name: '🔗 Link',
            value: `https://dad-games.henke-net.com/sessions`,
            inline: false
          }
        ],
        footer: {
          text: 'Dad Gaming Hub'
        },
        timestamp: new Date().toISOString()
      }]
    };

    await axios.post(discordWebhookUrl, embed);
    console.log('✅ Discord notification sent successfully');
  } catch (error) {
    console.error('❌ Discord webhook error:', error.message);
    // Don't throw - continue even if Discord fails
  }
};

export const createSession = async (req, res) => {
  try {
    const { game, platform, maxPlayers, scheduledFor, description, discordWebhookUrl } = req.body;

    // Get host profile with Discord webhook URL
    const { data: hostProfile } = await supabase
      .from('profiles')
      .select('name, discord_webhook_url')
      .eq('id', req.userId)
      .single();

    // Use provided webhook URL or fall back to profile webhook URL
    const webhookUrl = discordWebhookUrl || hostProfile?.discord_webhook_url;

    const { data: session, error } = await supabase
      .from('gaming_sessions')
      .insert({
        game,
        platform,
        max_players: maxPlayers || 4,
        scheduled_for: scheduledFor,
        description: description || '',
        discord_webhook_url: webhookUrl || null,
        host_id: req.userId,
        participants: [req.userId]
      })
      .select()
      .single();

    if (error) {
      console.error('Create session error:', error);
      return res.status(500).json({ error: 'Fehler beim Erstellen der Session' });
    }

    // Send Discord notification if webhook URL available (from session or profile)
    if (webhookUrl && hostProfile) {
      await sendDiscordNotification(session, hostProfile.name, webhookUrl);
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
      .order('scheduled_for', { ascending: true });

    if (error) {
      console.error('Get sessions error:', error);
      return res.status(500).json({ error: 'Fehler beim Laden der Sessions' });
    }

    // Fetch host and participant details for each session
    const enrichedSessions = await Promise.all(sessions.map(async (session) => {
      // Get host profile
      const { data: hostProfile } = await supabase
        .from('profiles')
        .select('id, name, username, avatar')
        .eq('id', session.host_id)
        .single();

      // Get participant profiles
      const { data: participantProfiles } = await supabase
        .from('profiles')
        .select('id, name, username, avatar')
        .in('id', session.participants || []);

      return {
        ...session,
        host: hostProfile || { id: session.host_id, name: 'Unknown' },
        participants: participantProfiles || []
      };
    }));

    res.json(enrichedSessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden der Sessions' });
  }
};

export const getSession = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: session, error } = await supabase
      .from('gaming_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !session) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden der Session' });
  }
};

export const updateParticipantStatus = async (req, res) => {
  try {
    res.json({ message: 'Teilnehmerstatus aktualisiert' });
  } catch (error) {
    console.error('Update participant status error:', error);
    res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Status' });
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
    console.log(`🗑️ Delete request for session ${id} by user ${req.userId}`);

    const { data: session, error: fetchError } = await supabase
      .from('gaming_sessions')
      .select('host_id')
      .eq('id', id)
      .single();

    if (fetchError || !session) {
      console.error('Session not found:', fetchError);
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    console.log(`Session host: ${session.host_id}, Request user: ${req.userId}`);

    if (session.host_id !== req.userId) {
      console.error(`Permission denied: ${session.host_id} !== ${req.userId}`);
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

    console.log(`✅ Session ${id} successfully deleted`);
    res.json({ message: 'Session gelöscht' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Serverfehler beim Löschen' });
  }
};
