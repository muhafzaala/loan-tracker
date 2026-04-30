export const validateLoanInput = (req, res, next) => {
  const { loanTitle, principal, interestRate, tenureMonths, startDate } = req.body;

  if (!loanTitle || typeof loanTitle !== 'string' || loanTitle.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Loan title is required.' });
  }

  if (!principal || isNaN(principal) || Number(principal) <= 0) {
    return res.status(400).json({ success: false, message: 'Principal must be a positive number.' });
  }

  if (!interestRate || isNaN(interestRate) || Number(interestRate) <= 0) {
    return res.status(400).json({ success: false, message: 'Interest rate must be greater than 0.' });
  }

  if (!tenureMonths || isNaN(tenureMonths) || Number(tenureMonths) <= 0) {
    return res.status(400).json({ success: false, message: 'Tenure must be at least 1 month.' });
  }

  if (!startDate || isNaN(new Date(startDate).getTime())) {
    return res.status(400).json({ success: false, message: 'A valid start date is required.' });
  }

  next();
};

export const validatePaymentInput = (req, res, next) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Payment amount must be a positive number.' });
  }

  next();
};

export const validateSignupInput = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'A valid email is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  next();
};
