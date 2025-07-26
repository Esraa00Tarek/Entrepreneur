import winston from 'winston';
import path from 'path';

// تنسيق السجلات
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// تنسيق للعرض في console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// إنشاء logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // سجل الأخطاء
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // سجل عام
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// إضافة console transport في بيئة التطوير
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// دوال مساعدة للـ logging
export const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

export const logError = (message, error = null, meta = {}) => {
  if (error) {
    logger.error(message, { error: error.message, stack: error.stack, ...meta });
  } else {
    logger.error(message, meta);
  }
};

export const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

export const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

// middleware للـ logging
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (req.user) {
      logData.userId = req.user.id;
      logData.userRole = req.user.role;
    }

    if (res.statusCode >= 400) {
      logError('HTTP Request Error', null, logData);
    } else {
      logInfo('HTTP Request', logData);
    }
  });

  next();
};

// دالة لـ logging الأخطاء غير المعالجة
export const logUnhandledError = (error, req = null) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  if (req) {
    logData.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (req.user) {
      logData.request.userId = req.user.id;
    }
  }

  logError('Unhandled Error', error, logData);
};

// دالة لـ logging العمليات الحساسة
export const logSecurityEvent = (event, details) => {
  logWarn(`Security Event: ${event}`, {
    ...details,
    timestamp: new Date().toISOString(),
    type: 'security'
  });
};

// دالة لـ logging عمليات المستخدمين
export const logUserActivity = (userId, action, details = {}) => {
  logInfo(`User Activity: ${action}`, {
    userId,
    action,
    ...details,
    timestamp: new Date().toISOString(),
    type: 'user_activity'
  });
};

// دالة لـ logging عمليات الإدارة
export const logAdminActivity = (adminId, action, details = {}) => {
  logInfo(`Admin Activity: ${action}`, {
    adminId,
    action,
    ...details,
    timestamp: new Date().toISOString(),
    type: 'admin_activity'
  });
};

export default logger; 