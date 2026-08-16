import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── User Schema ──────────────────────────────────────────────────────────────
// Represents an authenticated user of the GeoMonitor consumer application.
// Password hash is NEVER returned in API responses.
// ─────────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      maxlength: [255, 'Email cannot exceed 255 characters'],
    },

    passwordHash: {
      type: String,
      default: null,
      select: false, // Hidden by default from queries
    },

    googleId: {
      type: String,
      default: null,
      index: true,
    },

    avatar: {
      type: String,
      default: '',
    },

    authProvider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE', 'BOTH'],
      default: 'LOCAL',
    },

    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],

    preferences: {
      interestedDomains: {
        type: [String],
        default: [],
      },
      interestedCountries: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Method: Verify entered password against stored bcrypt hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static: Hash password securely with bcrypt
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const User = mongoose.model('User', userSchema);
