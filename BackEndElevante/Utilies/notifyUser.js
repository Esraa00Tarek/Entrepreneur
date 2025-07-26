import Notification from '../models/Notification.js';
import { io } from '../server.js';

/**
 * @desc    Centralized notification utility
 * @param   {Object} params
 * @param   {String|ObjectId} params.userId - Recipient user
 * @param   {String} params.type - Notification type (deal, request, message, review, manual, etc)
 * @param   {String} params.title - Notification title/message
 * @param   {String|ObjectId} [params.relatedEntityId] - Optional related entity
 * @param   {String} [params.actionUser] - User who triggered the notification
 * @param   {String} [params.actionUserName] - Name of the user who triggered the notification
 * @param   {String} [params.actionUserAvatar] - Avatar of the user who triggered the notification
 * @param   {String} [params.entityType] - Type of the related entity
 * @param   {String} [params.entityId] - ID of the related entity
 * @param   {String} [params.entityName] - Name of the related entity
 * @param   {String} [params.redirectUrl] - URL to redirect to
 * @param   {Object} [params.options] - Any extra fields
 */
export async function notifyUser({ userId, type, title, relatedEntityId, actionUser, actionUserName, actionUserAvatar, entityType, entityId, entityName, redirectUrl, options }) {
  if (!userId || !type || !title) return;
  const userIdStr = userId.toString();
  const notification = await Notification.create({
    userId: userIdStr,
    type,
    title,
    relatedEntityId,
    actionUser,
    actionUserName,
    actionUserAvatar,
    entityType,
    entityId,
    entityName,
    redirectUrl,
    ...options
  });
   // ✅ Emit via socket.io
   io.to(`notifications:${userIdStr}`).emit('receiveNotification', notification);
   if (options && options.withdrawn) {
     io.to(`notifications:${userIdStr}`).emit('removeNotification', { entityId, entityType });
   }
} 