export function calculateEMI(principal, rate, tenure) {
  const monthlyRate = rate / 100 / 12;
  if (monthlyRate === 0) return principal / tenure;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi * 100) / 100;
}

export function getTotalInterest(principal, rate, tenure) {
  const emi = calculateEMI(principal, rate, tenure);
  return Math.round((emi * tenure - principal) * 100) / 100;
}

export function getLoanStatus(loan) {
  const totalInterest = getTotalInterest(loan.principal, loan.interestRate, loan.tenureMonths);
  const totalOwed = loan.principal + totalInterest;
  const endDate = new Date(loan.startDate);
  endDate.setMonth(endDate.getMonth() + loan.tenureMonths);

  if (loan.amountPaid >= totalOwed) return 'completed';
  if (new Date() > endDate) return 'overdue';
  return 'active';
}

export function getRepaymentTrend(loan) {
  const emi = calculateEMI(loan.principal, loan.interestRate, loan.tenureMonths);
  const startDate = new Date(loan.startDate);
  const trend = [];

  for (let month = 1; month <= loan.tenureMonths; month++) {
    const expectedDate = new Date(startDate);
    expectedDate.setMonth(startDate.getMonth() + month);

    const expectedCumulative = Math.round(emi * month * 100) / 100;

    const actualCumulative = loan.payments
      .filter((p) => new Date(p.date) <= expectedDate)
      .reduce((sum, p) => sum + p.amount, 0);

    trend.push({
      month,
      label: expectedDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
      expected: expectedCumulative,
      actual: Math.round(actualCumulative * 100) / 100,
    });
  }

  return trend;
}

export function getInterestAccumulation(loan) {
  const totalInterest = getTotalInterest(loan.principal, loan.interestRate, loan.tenureMonths);
  const totalPaid = loan.amountPaid;
  const principalPaid = Math.min(loan.principal, totalPaid);
  const interestPaid = Math.max(0, totalPaid - principalPaid);
  const interestRemaining = Math.max(0, totalInterest - interestPaid);

  return {
    totalInterest,
    interestPaid: Math.round(interestPaid * 100) / 100,
    interestRemaining: Math.round(interestRemaining * 100) / 100,
  };
}

export function isAheadOfSchedule(loan) {
  const emi = calculateEMI(loan.principal, loan.interestRate, loan.tenureMonths);
  const startDate = new Date(loan.startDate);
  const now = new Date();
  const monthsElapsed = Math.max(
    0,
    (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
  );
  const expectedByNow = emi * monthsElapsed;
  return loan.amountPaid >= expectedByNow;
}
