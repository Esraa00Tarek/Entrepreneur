import rateLimit from 'express-rate-limit';

// حد عام للطلبات
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب لكل IP
  message: {
    error: 'Too many requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// حد لتسجيل الدخول
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات تسجيل دخول
  message: {
    error: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // تجاهل الطلبات الناجحة
});

// حد للتسجيل
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 محاولات تسجيل
  message: {
    error: 'Too many signup attempts. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// حد لرفع الملفات
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 10, // 10 ملفات
  message: {
    error: 'Too many files uploaded. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// حد للطلبات الحساسة (admin routes)
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 50, // 50 طلب
  message: {
    error: 'Too many requests from sensitive routes. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// حد مخصص حسب الدور
export const createRoleBasedLimiter = (role, maxRequests) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: maxRequests,
    message: {
      error: `Too many requests from ${role} users. Please try again after 15 minutes.`
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // استخدام ID المستخدم إذا كان مسجل الدخول
      return req.user ? req.user.id : req.ip;
    }
  });
};

// حد للطلبات حسب IP مع استثناءات
export const ipBasedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100,
  message: {
    error: 'Too many requests from this IP'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // تجاهل بعض المسارات أو IPs معينة
    const skipPaths = ['/api/health', '/api/status'];
    return skipPaths.includes(req.path);
  }
}); 