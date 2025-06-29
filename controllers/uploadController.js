import multer from 'multer';
import path from 'path';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  try {
    const result = await uploadToCloudinary(req.file.path, 'uploads');

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed'
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one image'
    });
  }

  try {
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.path, 'uploads')
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map(result => ({
      public_id: result.public_id,
      secure_url: result.secure_url
    }));

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: images
    });

  } catch (error) {
    console.error('Images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Images upload failed'
    });
  }
});