import mongoose from 'mongoose';

const messageThreadSchema = new mongoose.Schema({
  // Unified to ObjectId for relational integrity and population support
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  
  // New conversation types
  type: { 
    type: String, 
    enum: ['general', 'pre-deal', 'deal-progress', 'ost-order', 'offer-negotiation', 'support'], 
    default: 'general' 
  },
  
  // Related references
  relatedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business'},
  relatedDealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  relatedOfferId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  relatedRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  
  // Additional conversation info
  title: { type: String }, // Conversation title
  isActive: { type: Boolean, default: true }, // Is conversation active
  isArchived: { type: Boolean, default: false }, // Is conversation archived
  
  lastMessage: { type: String },
  lastMessageTime: { type: Date },
  lastMessageSender: { type: String }, // Last message sender ID
  
  // Conversation settings
  allowAttachments: { type: Boolean, default: true },
  allowFileSharing: { type: Boolean, default: true },
  
}, { timestamps: true });

// Indexes for fast search
messageThreadSchema.index({ participants: 1, type: 1 });
messageThreadSchema.index({ relatedDealId: 1, type: 1 });
messageThreadSchema.index({ relatedOrderId: 1, type: 1 });
messageThreadSchema.index({ relatedOfferId: 1, type: 1 });

const MessageThread = mongoose.model('MessageThread', messageThreadSchema);
export default MessageThread;
