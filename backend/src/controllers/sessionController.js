import GamingSession from '../models/GamingSession.js';
import Notification from '../models/Notification.js';

export const createSession = async (req, res) => {
  try {
    const {
      title,
      game,
      platform,
      scheduledDate,
      maxParticipants,
      duration,
      description,
      voiceChat,
      skillLevel,
      isPrivate
    } = req.body;

    const session = new GamingSession({
      title,
      game,
      platform,
      host: req.userId,
      scheduledDate,
      maxParticipants,
      duration,
      description,
      voiceChat,
      skillLevel,
      isPrivate
    });

    await session.save();
    await session.populate('host', 'username name');

    res.status(201).json({
      message: 'Gaming-Session erfolgreich erstellt',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Session' });
  }
};

export const getSessions = async (req, res) => {
  try {
    const { status, platform, game } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    if (game) filter.game = new RegExp(game, 'i');

    // Only show public sessions or sessions where user is host/participant
    filter.$or = [
      { isPrivate: false },
      { host: req.userId },
      { 'participants.user': req.userId }
    ];

    const sessions = await GamingSession.find(filter)
      .populate('host', 'username name avatar')
      .populate('participants.user', 'username name avatar')
      .sort({ scheduledDate: 1 });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Sessions' });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await GamingSession.findById(req.params.id)
      .populate('host', 'username name avatar contacts')
      .populate('participants.user', 'username name avatar');

    if (!session) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    // Check if user has access to private session
    if (session.isPrivate) {
      const isParticipant = session.participants.some(
        p => p.user._id.toString() === req.userId.toString()
      );
      const isHost = session.host._id.toString() === req.userId.toString();

      if (!isHost && !isParticipant) {
        return res.status(403).json({ error: 'Zugriff verweigert' });
      }
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Session' });
  }
};

export const joinSession = async (req, res) => {
  try {
    const session = await GamingSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    // Check if already a participant
    const alreadyJoined = session.participants.some(
      p => p.user.toString() === req.userId.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({ error: 'Bereits der Session beigetreten' });
    }

    // Check if session is full
    const confirmedCount = session.participants.filter(
      p => p.status === 'confirmed'
    ).length;

    if (confirmedCount >= session.maxParticipants) {
      return res.status(400).json({ error: 'Session ist voll' });
    }

    // Add participant
    session.participants.push({
      user: req.userId,
      status: 'pending'
    });

    await session.save();
    await session.populate('host', 'username name');
    await session.populate('participants.user', 'username name');

    // Create notification for host
    await Notification.create({
      recipient: session.host._id,
      sender: req.userId,
      type: 'session_invite',
      title: 'Neue Beitrittsanfrage',
      message: `Jemand möchte deiner Session "${session.title}" beitreten`,
      relatedSession: session._id
    });

    res.json({
      message: 'Erfolgreich beigetreten',
      session
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Fehler beim Beitreten der Session' });
  }
};

export const updateParticipantStatus = async (req, res) => {
  try {
    const { participantId, status } = req.body;
    const session = await GamingSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    // Only host can update participant status
    if (session.host.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Nur der Host kann Teilnehmer bestätigen' });
    }

    const participant = session.participants.find(
      p => p.user.toString() === participantId
    );

    if (!participant) {
      return res.status(404).json({ error: 'Teilnehmer nicht gefunden' });
    }

    participant.status = status;
    await session.save();

    // Create notification for participant
    const notificationType = status === 'confirmed' ? 'session_accepted' : 'session_declined';
    const notificationMessage = status === 'confirmed'
      ? `Deine Anfrage für "${session.title}" wurde akzeptiert`
      : `Deine Anfrage für "${session.title}" wurde abgelehnt`;

    await Notification.create({
      recipient: participantId,
      sender: req.userId,
      type: notificationType,
      title: status === 'confirmed' ? 'Anfrage akzeptiert' : 'Anfrage abgelehnt',
      message: notificationMessage,
      relatedSession: session._id
    });

    res.json({
      message: 'Teilnehmerstatus aktualisiert',
      session
    });
  } catch (error) {
    console.error('Update participant status error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Status' });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await GamingSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    // Only host can delete session
    if (session.host.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Nur der Host kann die Session löschen' });
    }

    // Notify all participants
    for (const participant of session.participants) {
      await Notification.create({
        recipient: participant.user,
        sender: req.userId,
        type: 'session_cancelled',
        title: 'Session abgesagt',
        message: `Die Session "${session.title}" wurde abgesagt`,
        relatedSession: session._id
      });
    }

    await session.deleteOne();

    res.json({ message: 'Session erfolgreich gelöscht' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Session' });
  }
};
