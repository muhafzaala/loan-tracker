import express from 'express';
import mongoose from 'mongoose';
import Loan from '../models/Loan.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Aggregation query: group payments by month, sum amounts
router.get('/trend', async (req, res) => {
  try {
    const monthlyTrend = await Loan.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $unwind: '$payments' },
      {
        $group: {
          _id: {
            year: { $year: '$payments.date' },
            month: { $month: '$payments.date' },
          },
          totalPaid: { $sum: '$payments.amount' },
          paymentCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalPaid: 1,
          paymentCount: 1,
          label: {
            $concat: [
              {
                $arrayElemAt: [
                  ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  '$_id.month',
                ],
              },
              ' ',
              { $toString: '$_id.year' },
            ],
          },
        },
      },
    ]);

    return res.json({ success: true, data: monthlyTrend });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch trend data.' });
  }
});

// Summary card: total active loans, outstanding principal, avg repayment rate
router.get('/summary', async (req, res) => {
  try {
    // Filter + sort query: active loans sorted by startDate desc
    const activeLoans = await Loan.find({ userId: req.userId, status: 'active' }).sort({ startDate: -1 });
    const allLoans = await Loan.find({ userId: req.userId });

    const totalActiveLoans = activeLoans.length;
    const totalOutstandingPrincipal = activeLoans.reduce((sum, loan) => sum + (loan.principal - loan.amountPaid), 0);

    // Average repayment rate over last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    let totalExpectedLast3 = 0;
    let totalActualLast3 = 0;

    for (const loan of allLoans) {
      const monthlyRate = loan.interestRate / 100 / 12;
      const emi =
        monthlyRate === 0
          ? loan.principal / loan.tenureMonths
          : (loan.principal * monthlyRate * Math.pow(1 + monthlyRate, loan.tenureMonths)) /
            (Math.pow(1 + monthlyRate, loan.tenureMonths) - 1);

      totalExpectedLast3 += emi * 3;

      const recentPayments = loan.payments.filter((p) => new Date(p.date) >= threeMonthsAgo);
      totalActualLast3 += recentPayments.reduce((sum, p) => sum + p.amount, 0);
    }

    const avgRepaymentRate =
      totalExpectedLast3 > 0 ? Math.round((totalActualLast3 / totalExpectedLast3) * 100) : 0;

    return res.json({
      success: true,
      data: {
        totalActiveLoans,
        totalOutstandingPrincipal: Math.max(0, totalOutstandingPrincipal),
        avgRepaymentRate,
        totalLoans: allLoans.length,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch summary.' });
  }
});

export default router;
