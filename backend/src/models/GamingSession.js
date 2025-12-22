import mongoose from 'mongoose';

const gamingSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  game: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['PC', 'PS5', 'Xbox', 'Switch']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined'],
      default: 'pending'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxParticipants: {
    type: Number,
    default: 4
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 120
  },
  description: {
    type: String,
    default: ''
  },
  voiceChat: {
    type: String,
    enum: ['Discord', 'Party Chat', 'In-Game', 'None'],
    default: 'Discord'
  },
  skillLevel: {
    type: String,
    enum: ['Anfänger', 'Fortgeschritten', 'Profi', 'Egal'],
    default: 'Egal'
  },
  status: {
    type: String,
    enum: ['open', 'full', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-update status based on participant count
gamingSessionSchema.pre('save', function(next) {
  const confirmedParticipants = this.participants.filter(p => p.status === 'confirmed').length;

  if (confirmedParticipants >= this.maxParticipants && this.status === 'open') {
    this.status = 'full';
  } else if (confirmedParticipants < this.maxParticipants && this.status === 'full') {
    this.status = 'open';
  }

  next();
});

const GamingSession = mongoose.model('GamingSession', gamingSessionSchema);

export default GamingSession;
