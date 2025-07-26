import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessageThread', required: true },
  // Unified to ObjectId for relational integrity and population support
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  
  // Message type
  messageType: {
    type: String,
    enum: ['text', 'attachment', 'system', 'deal_update', 'order_update', 'offer_update'],
    default: 'text'
  },
  
  // Attachments
  attachments: [
    {
      url: String,
      public_id: String,
      fileType: String,
      fileName: String,
      fileSize: Number
    }
  ],
  
  // Message status
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  
  // Additional info for system messages
  systemData: {
    action: String, // e.g.,deal_created,status_changed',payment_received'
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // Related reference IDs
  relatedDealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  relatedOfferId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  
  // Additional info
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  replyToMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isDeleted: { type: Boolean, default: false },
  
}, { timestamps: true });

// Indexes for fast search
messageSchema.index({ threadId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ relatedDealId: 1, createdAt: -1 });
messageSchema.index({ relatedOrderId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
