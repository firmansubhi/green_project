const PaymentPlatform = require('../services/paymentPlatform');

exports.processPayment = async (req, res) => {
  const { transactionId } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    const paymentResult = await PaymentPlatform.process(transaction);
    if (!paymentResult.success) {
      return res.status(400).json({ status: 'error', message: 'Payment failed' });
    }
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.confirmPaymentStatus = async (req, res) => {
  const { transactionId } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    const balance = await PaymentPlatform.checkBalance(transaction.buyerId);

    if (balance < transaction.amount) {
      await PaymentPlatform.notifyInsufficientFunds(transaction.buyerId);
      return res.status(400).json({ status: 'error', message: 'Insufficient funds' });
    }

    await PaymentPlatform.executePayment(transaction);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
