import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const getUsers = async (req, res) => {
  try {
    const { search, platform, online } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
        { games: new RegExp(search, 'i') }
      ];
    }

    if (platform) {
      filter.platforms = platform;
    }

    if (online !== undefined) {
      filter.online = online === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Benutzer' });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username name online currentActivity avatar');

    if (!user) {
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
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    if (targetUser._id.toString() === req.userId.toString()) {
      return res.status(400).json({ error: 'Du kannst dir selbst keine Freundschaftsanfrage senden' });
    }

    // Check if already friends
    if (currentUser.friends.includes(targetUser._id)) {
      return res.status(400).json({ error: 'Bereits befreundet' });
    }

    // Check if request already sent
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === currentUser._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ error: 'Anfrage bereits gesendet' });
    }

    // Add friend request
    targetUser.friendRequests.push({
      from: currentUser._id
    });

    await targetUser.save();

    // Create notification
    await Notification.create({
      recipient: targetUser._id,
      sender: currentUser._id,
      type: 'friend_request',
      title: 'Neue Freundschaftsanfrage',
      message: `${currentUser.name} möchte dein Freund werden`
    });

    res.json({ message: 'Freundschaftsanfrage gesendet' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Fehler beim Senden der Freundschaftsanfrage' });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req.from.toString() === req.params.id
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Freundschaftsanfrage nicht gefunden' });
    }

    const senderId = currentUser.friendRequests[requestIndex].from;

    // Add to friends list (both users)
    currentUser.friends.push(senderId);
    currentUser.friendRequests.splice(requestIndex, 1);
    await currentUser.save();

    const sender = await User.findById(senderId);
    sender.friends.push(currentUser._id);
    await sender.save();

    // Create notification
    await Notification.create({
      recipient: senderId,
      sender: currentUser._id,
      type: 'friend_accepted',
      title: 'Freundschaftsanfrage akzeptiert',
      message: `${currentUser.name} hat deine Freundschaftsanfrage akzeptiert`
    });

    res.json({ message: 'Freundschaftsanfrage akzeptiert' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Fehler beim Akzeptieren der Freundschaftsanfrage' });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req.from.toString() === req.params.id
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Freundschaftsanfrage nicht gefunden' });
    }

    currentUser.friendRequests.splice(requestIndex, 1);
    await currentUser.save();

    res.json({ message: 'Freundschaftsanfrage abgelehnt' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Fehler beim Ablehnen der Freundschaftsanfrage' });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const friendId = req.params.id;

    if (!currentUser.friends.includes(friendId)) {
      return res.status(400).json({ error: 'Nicht in der Freundesliste' });
    }

    // Remove from both users' friend lists
    currentUser.friends = currentUser.friends.filter(
      id => id.toString() !== friendId
    );
    await currentUser.save();

    const friend = await User.findById(friendId);
    friend.friends = friend.friends.filter(
      id => id.toString() !== req.userId.toString()
    );
    await friend.save();

    res.json({ message: 'Freund entfernt' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Fehler beim Entfernen des Freundes' });
  }
};

export const updateOnlineStatus = async (req, res) => {
  try {
    const { online, currentActivity } = req.body;
    const user = await User.findById(req.userId);

    user.online = online;
    if (currentActivity !== undefined) {
      user.currentActivity = currentActivity;
    }

    await user.save();

    res.json({
      message: 'Status aktualisiert',
      online: user.online,
      currentActivity: user.currentActivity
    });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Status' });
  }
};
