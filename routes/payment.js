const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Define routes
router.post('/process', paymentController.processPayment);
router.post('/confirm-status', paymentController.confirmPaymentStatus);

// Export the router
module.exports = router;