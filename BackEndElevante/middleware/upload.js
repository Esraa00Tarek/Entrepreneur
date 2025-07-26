import multer from 'multer';
import { uploadToCloudinary as uploadFileToCloudinary } from '../Utilies/cloudinary.js';

// Memory storage
const storage = multer.memoryStorage();

// Accept all file types
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const baseMulter = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Upload single file
export const uploadSingle = (fieldName) => baseMulter.single(fieldName);

// Upload multiple files
export const uploadMultiple = (fieldName) => baseMulter.array(fieldName, 10);

// OLD FUNCTION — KEEPING FOR BACKWARD COMPATIBILITY
export const uploadMultipleImagesToCloudinary = (fieldName, folder = 'uploads') => {
  return (req, res, next) => {
    uploadMultiple(fieldName)(req, res, async (err) => {
      if (err) return handleUploadError(err, req, res, next);
      
      // ✅ لو مفيش فايلات، كمل عادي
      if (!req.files || req.files.length === 0) {
        req.imageUrls = [];
        return next();
      }

      try {
        const imageUrls = [];
        for (const file of req.files) {
          const result = await uploadFileToCloudinary(
            file.buffer,
            file.originalname,
            file.mimetype,
            folder
          );
          imageUrls.push(result.secure_url);
        }

        req.imageUrls = imageUrls;
        next();
      } catch (error) {
        console.error('Cloudinary multi-upload failed:', error);
        res.status(500).json({ error: 'Failed to upload files to Cloudinary' });
      }
    });
  };
};

// ✅ NEW FUNCTION: general-purpose multiple file uploader
export const uploadMultipleFilesToCloudinary = (fieldName, folder = 'uploads') => {
  return (req, res, next) => {
    // Use multer with proper configuration to handle both file and non-file fields
    const upload = multer({
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      }
    }).array(fieldName, 10);

    upload(req, res, async (err) => {
      if (err) return handleUploadError(err, req, res, next);

      // ✅ لو مفيش فايلات، كمل عادي
      if (!req.files || req.files.length === 0) {
        req.attachments = [];
        return next();
      }

      try {
        const attachments = [];

        for (const file of req.files) {
          const result = await uploadFileToCloudinary(
            file.buffer,
            file.originalname,
            file.mimetype,
            folder
          );

          attachments.push({
            url: result.secure_url,
            public_id: result.public_id,
            fileType: file.mimetype,
            originalName: file.originalname,
            fileSize: file.size
          });
        }

        req.attachments = attachments;
        next();
      } catch (error) {
        console.error('Cloudinary multi-upload failed:', error);
        res.status(500).json({ error: 'Failed to upload files to Cloudinary' });
      }
    });
  };
};

// Upload user files (used for registration)
export const uploadUserFiles = baseMulter.fields([
  { name: 'idCardFront', maxCount: 1 },
  { name: 'idCardBack', maxCount: 1 },
  { name: 'pitchDeckFile', maxCount: 1 },
  { name: 'companyProfile', maxCount: 1 },
]);

// 📌 Middleware: رفع ملف واحد + إرساله لـ Cloudinary
export const uploadOneToCloudinary = (fieldName, folder = 'uploads') => {
  return (req, res, next) => {
    console.log('Starting uploadOneToCloudinary for field:', fieldName);
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Use multer with preserveExtension option to handle both file and non-file fields
    const upload = multer({
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        console.log('File filter called for:', file?.originalname);
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      }
    }).single(fieldName);

    upload(req, res, async (err) => {
      console.log('Upload callback - error:', err);
      console.log('Request body after upload:', req.body);
      console.log('Request file after upload:', req.file);
      
      if (err) return handleUploadError(err, req, res, next);
      
      // ✅ لو مفيش ملف، كمل عادي
      if (!req.file) {
        console.log('No file uploaded, continuing...');
        req.cloudinaryFileInfo = null;
        return next();
      }

      try {
        console.log('Uploading file to Cloudinary:', req.file.originalname);
        const result = await uploadFileToCloudinary(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          folder
        );
        req.cloudinaryFileUrl = result.secure_url;
        req.cloudinaryFileInfo = result;
        console.log('File uploaded successfully to Cloudinary');
        next();
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        res.status(500).json({ error: 'فشل رفع الملف إلى Cloudinary' });
      }
    });
  };
};

// ✅ NEW FUNCTION: Handle both multiple images and single file uploads
export const uploadServiceFiles = (imageField = 'images', fileField = 'serviceFile', folder = 'services') => {
  return (req, res, next) => {
    console.log('Starting uploadServiceFiles');
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Use multer fields to handle multiple file types
    const upload = multer({
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        console.log('File filter called for:', file?.originalname, 'field:', file?.fieldname);
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      }
    }).fields([
      { name: imageField, maxCount: 10 },
      { name: fileField, maxCount: 1 }
    ]);

    upload(req, res, async (err) => {
      console.log('Upload callback - error:', err);
      console.log('Request body after upload:', req.body);
      console.log('Request files after upload:', req.files);
      
      if (err) return handleUploadError(err, req, res, next);
      
      try {
        const imageUrls = [];
        const fileUrls = [];

        // Process images
        if (req.files && req.files[imageField]) {
          console.log('Processing images...');
          for (const file of req.files[imageField]) {
            const result = await uploadFileToCloudinary(
              file.buffer,
              file.originalname,
              file.mimetype,
              folder
            );
            imageUrls.push(result.secure_url);
          }
        }

        // Process single file
        if (req.files && req.files[fileField] && req.files[fileField][0]) {
          console.log('Processing single file...');
          const file = req.files[fileField][0];
          const result = await uploadFileToCloudinary(
            file.buffer,
            file.originalname,
            file.mimetype,
            folder
          );
          fileUrls.push(result.secure_url);
          req.cloudinaryFileUrl = result.secure_url;
          req.cloudinaryFileInfo = result;
        }

        req.imageUrls = imageUrls;
        req.fileUrls = fileUrls;
        
        console.log('Upload completed successfully');
        console.log('Image URLs:', imageUrls);
        console.log('File URLs:', fileUrls);
        
        next();
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        res.status(500).json({ error: 'Failed to upload files to Cloudinary' });
      }
    });
  };
};

// Error handling
export const handleUploadError = (error, req, res, next) => {
  console.error('Upload error details:', {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: error.stack
  });

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ error: 'File too large. Max size is 10MB' });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ error: 'Too many files uploaded' });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ error: 'Unexpected file field' });
      default:
        return res.status(400).json({ error: `Multer error: ${error.message}` });
    }
  }

  // Check for specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: `Validation error: ${error.message}` });
  }

  if (error.name === 'TypeError') {
    return res.status(400).json({ error: `Type error: ${error.message}` });
  }

  console.error('Upload error:', error);
  res.status(500).json({ 
    error: 'File upload error', 
    details: error.message,
    type: error.name 
  });
};