const path = require('path');
const fs = require('fs');
const multer = require('multer');
const attachmentService = require('../services/attachment.service');

// Configure storage for multer
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer instance with 25MB size limit
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
}).single('file');

exports.uploadMiddleware = upload;

/**
 * GET /api/orders/:orderId/attachments
 * Get all non-quarantined attachments for an order.
 */
exports.getOrderAttachments = async (req, res) => {
  try {
    const { orderId } = req.params;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!orderId || !UUID_REGEX.test(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'orderId', message: 'Must be a valid UUID' }],
      });
    }

    const attachments = await attachmentService.getOrderAttachments(req.user.id, orderId);

    return res.status(200).json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/orders/:orderId/attachments
 * Upload a file attachment.
 */
exports.uploadAttachment = async (req, res) => {
  const { orderId } = req.params;
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!orderId || !UUID_REGEX.test(orderId)) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'orderId', message: 'Must be a valid UUID' }],
    });
  }

  // If file was not processed by multer
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'file', message: 'Binary file is required' }],
    });
  }

  try {
    const { orderId } = req.params;
    const { file_type, message_id, proof_id } = req.body;

    // Validate file_type
    const validFileTypes = ['image', 'video', 'pdf', 'receipt'];
    if (!file_type || !validFileTypes.includes(file_type)) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'file_type',
            message: 'Valid file_type is required (image, video, pdf, receipt)',
          },
        ],
      });
    }

    // Validate that at least one ID link is provided
    if (!message_id && !proof_id) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'context',
            message: 'Attachment must be linked to either a message_id or proof_id',
          },
        ],
      });
    }

    // Save attachment in database (initially with scan_status = pending)
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileSizeBytes = req.file.size;

    const attachment = await attachmentService.createAttachment({
      buyerId: req.user.id,
      orderId,
      fileUrl,
      fileType: file_type,
      fileSizeBytes,
      messageId: message_id || null,
      proofId: proof_id || null,
    });

    return res.status(201).json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    // Clean up file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
