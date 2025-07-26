import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Unified to ObjectId for relational integrity and population support
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deal', 'request', 'review', 'offer', 'manual', 'direct-request', 'business', 'milestone'], required: true },
  title: { type: String, required: true },
  actionUser: { type: String }, // userId of the user who triggered the notification
  actionUserName: { type: String }, // display name
  actionUserAvatar: { type: String }, // avatar URL
  entityType: { type: String }, // e.g., 'business', 'milestone', etc.
  entityId: { type: String }, // ID of the related entity
  entityName: { type: String }, // name/title of the entity
  redirectUrl: { type: String }, // URL to redirect to
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);