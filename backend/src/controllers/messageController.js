import Message from '../models/Message.js';
import User from '../models/User.js';

export const sendMessage = async (req, res) => {
  try {
    const { recipient, content, session } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Nachricht darf nicht leer sein' });
    }

    const message = new Message({
      sender: req.userId,
      recipient,
      session,
      content: content.trim(),
      type: session ? 'session' : 'direct'
    });

    await message.save();
    await message.populate('sender', 'username name avatar');
    await message.populate('recipient', 'username name avatar');

    res.status(201).json({
      message: 'Nachricht gesendet',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Fehler beim Senden der Nachricht' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('sender', 'username name avatar')
      .populate('recipient', 'username name avatar');

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Unterhaltung' });
  }
};

export const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({ session: sessionId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('sender', 'username name avatar');

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get session messages error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Nachrichten' });
  }
};

export const getConversations = async (req, res) => {
  try {
    // Get all unique conversation partners
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.userId },
            { recipient: req.userId }
          ],
          type: 'direct'
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.userId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Populate user details
    const conversations = await User.populate(messages, {
      path: '_id',
      select: 'username name avatar online currentActivity'
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Unterhaltungen' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Message.updateMany(
      {
        sender: userId,
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

    res.json({ message: 'Nachrichten als gelesen markiert' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Fehler beim Markieren der Nachrichten' });
  }
};
