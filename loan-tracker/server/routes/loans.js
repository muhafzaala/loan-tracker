import express from 'express';
import Loan from '../models/Loan.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateLoanInput, validatePaymentInput } from '../middleware/validateInput.js';

const router = express.Router();

router.use(authMiddleware);

function computeLoanStatus(loan) {
  const monthlyRate = loan.interestRate / 100 / 12;
  const totalInterest =
    monthlyRate === 0
      ? 0
      : loan.principal * Math.pow(1 + monthlyRate, loan.tenureMonths) -
        loan.principal;

  const totalOwed = loan.principal + totalInterest;
  const endDate = new Date(loan.startDate);
  endDate.setMonth(endDate.getMonth() + loan.tenureMonths);

  if (loan.amountPaid >= totalOwed) return 'completed';
  if (new Date() > endDate) return 'overdue';
  return 'active';
}

router.get('/', async (req, res) => {
  const { status, sort } = req.query;

  try {
    const filter = { userId: req.userId };
    if (status && status !== 'all') filter.status = status;

    const loanList = await Loan.find(filter).sort({ startDate: -1 });

    return res.json({ success: true, data: loanList });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch loans.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });

    return res.json({ success: true, data: loan });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch loan.' });
  }
});

router.post('/', validateLoanInput, async (req, res) => {
  const { loanTitle, principal, interestRate, tenureMonths, startDate } = req.body;

  try {
    const newLoan = await Loan.create({
      userId: req.userId,
      loanTitle,
      principal: Number(principal),
      interestRate: Number(interestRate),
      tenureMonths: Number(tenureMonths),
      startDate: new Date(startDate),
      amountPaid: 0,
      status: 'active',
      payments: [],
    });

    return res.status(201).json({ success: true, data: newLoan });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to create loan.' });
  }
});

router.put('/:id/payment', validatePaymentInput, async (req, res) => {
  const { amount } = req.body;

  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });

    loan.payments.push({ date: new Date(), amount: Number(amount) });
    loan.amountPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
    loan.status = computeLoanStatus(loan);

    await loan.save();

    return res.json({ success: true, data: loan });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to record payment.' });
  }
});

export default router;
