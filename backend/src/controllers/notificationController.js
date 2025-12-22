import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;
    const filter = { recipient: req.userId };

    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('sender', 'username name avatar')
      .populate('relatedSession', 'title game scheduledDate');

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Benachrichtigungen' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.userId
    });

    if (!notification) {
      return res.status(404).json({ error: 'Benachrichtigung nicht gefunden' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      message: 'Benachrichtigung als gelesen markiert',
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Fehler beim Markieren der Benachrichtigung' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.userId,
        read: false
      },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );

    res.json({ message: 'Alle Benachrichtigungen als gelesen markiert' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Fehler beim Markieren der Benachrichtigungen' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.userId
    });

    if (!notification) {
      return res.status(404).json({ error: 'Benachrichtigung nicht gefunden' });
    }

    res.json({ message: 'Benachrichtigung gelöscht' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Benachrichtigung' });
  }
};
