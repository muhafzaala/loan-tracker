import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
});

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanTitle: {
      type: String,
      required: true,
      trim: true,
    },
    principal: {
      type: Number,
      required: true,
      min: 1,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0.01,
    },
    tenureMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'overdue'],
      default: 'active',
    },
    payments: [paymentSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Loan', loanSchema);
