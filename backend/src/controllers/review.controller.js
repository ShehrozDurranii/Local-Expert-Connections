const reviewService = require('../services/review.service');

/**
 * GET /api/orders/:orderId/review
 * Get the review for an order.
 */
exports.getOrderReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const review = await reviewService.getOrderReview(req.user.id, orderId);

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/orders/:orderId/review
 * Submit a review for a completed order.
 */
exports.submitReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    const ratingInt = parseInt(rating, 10);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'rating', message: 'Rating must be an integer between 1 and 5' }],
      });
    }

    // Validate comment length if provided
    if (comment && (typeof comment !== 'string' || comment.length > 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'comment', message: 'Comment must be a string and not exceed 1000 characters' },
        ],
      });
    }

    const review = await reviewService.submitReview({
      buyerId: req.user.id,
      orderId,
      rating: ratingInt,
      comment: comment ? comment.trim() : null,
    });

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
