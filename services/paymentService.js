const PaymentPlatform = require('../utils/paymentPlatform');

exports.processPayment = async (transaction) => {
  if (transaction.status !== 'approved') {
    throw new Error('Transaction must be approved before payment');
  }

  const paymentResult = await PaymentPlatform.executePayment(transaction.memberId, transaction.amount);
  if (!paymentResult.success) {
    throw new Error('Payment failed');
  }

  transaction.status = 'paid';
  await transaction.save();
  return transaction;
};
