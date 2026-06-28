const service = require('../services/offer.service');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(uuid) {
  return UUID_REGEX.test(uuid);
}

/**
 * GET /api/requests/:requestId/offers
 * Retrieves all expert offers submitted for a given request.
 */
exports.getOffers = async (req, res) => {
  try {
    const { requestId } = req.params;
    const buyerId = req.user.id;

    if (!requestId || !isValidUUID(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'requestId',
            message: 'Must be a valid UUID',
          },
        ],
      });
    }

    const offers = await service.getOffersByRequestId(buyerId, requestId);

    res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/offers/:offerId/accept
 * Accepts an expert's offer and creates a corresponding order.
 */
exports.acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const buyerId = req.user.id;

    if (!offerId || !isValidUUID(offerId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'offerId',
            message: 'Must be a valid UUID',
          },
        ],
      });
    }

    const order = await service.acceptOffer(buyerId, offerId);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/offers/:offerId/decline
 * Declines an expert's offer.
 */
exports.declineOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const buyerId = req.user.id;

    if (!offerId || !isValidUUID(offerId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'offerId',
            message: 'Must be a valid UUID',
          },
        ],
      });
    }

    await service.declineOffer(buyerId, offerId);

    res.status(200).json({
      success: true,
      message: 'Offer declined successfully',
    });
  } catch (error) {
    console.error('Error declining offer:', error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};
