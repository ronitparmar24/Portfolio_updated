import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    subject: { type: String, trim: true, maxlength: 150, default: 'Portfolio contact' },
    message: { type: String, required: true, trim: true, maxlength: 3000 },

    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
      index: true
    },

    // Never store the raw IP: a salted hash is enough to spot a repeat spammer,
    // and it keeps you out of "we collect personal data" territory.
    ipHash: { type: String, default: null },
    userAgent: { type: String, default: null, maxlength: 300 },
    emailDelivered: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Supports both the duplicate-submission check and "newest first" listings.
contactMessageSchema.index({ email: 1, createdAt: -1 });

// Automatically expire messages after 365 days to maintain free database tier hygiene.
contactMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
