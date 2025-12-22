import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GamingSession'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['direct', 'session', 'system'],
    default: 'direct'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient message queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ session: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
