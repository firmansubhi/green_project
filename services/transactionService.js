const Transaction = require('../models/Transaction');

exports.createTransaction = async (data) => {
  return await Transaction.create(data);
};

exports.finalizeTransaction = async (transactionId, receiverId) => {
  return await Transaction.findByIdAndUpdate(
    transactionId,
    { status: 'finalized', receiverId },
    { new: true }
  );
};

exports.approveTransaction = async (transactionId) => {
  return await Transaction.findByIdAndUpdate(
    transactionId,
    { adminApproved: true, status: 'approved' },
    { new: true }
  );
};
