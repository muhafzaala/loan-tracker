import { useNavigate } from 'react-router-dom';
import { calculateEMI, getTotalInterest } from '../utils/loanCalculations.js';
import './LoanCard.css';

export default function LoanCard({ loan }) {
  const navigate = useNavigate();
  const emi = calculateEMI(loan.principal, loan.interestRate, loan.tenureMonths);
  const totalInterest = getTotalInterest(loan.principal, loan.interestRate, loan.tenureMonths);
  const totalOwed = loan.principal + totalInterest;
  const progressPct = Math.min(100, Math.round((loan.amountPaid / totalOwed) * 100));

  return (
    <div className="loan-card" onClick={() => navigate(`/loan/${loan._id}`)}>
      <div className="loan-card-header">
        <div>
          <div className="loan-title">{loan.loanTitle}</div>
          <div className="loan-date">
            Started {new Date(loan.startDate).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}
          </div>
        </div>
        <span className={`badge badge-${loan.status}`}>{loan.status}</span>
      </div>

      <div className="loan-card-stats">
        <div className="stat">
          <span className="stat-label">Principal</span>
          <span className="stat-value mono">PKR {loan.principal.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">EMI</span>
          <span className="stat-value mono">PKR {emi.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Rate</span>
          <span className="stat-value">{loan.interestRate}% p.a.</span>
        </div>
        <div className="stat">
          <span className="stat-label">Tenure</span>
          <span className="stat-value">{loan.tenureMonths} mo</span>
        </div>
      </div>

      <div className="loan-progress">
        <div className="progress-labels">
          <span>Paid: <span className="mono">PKR {loan.amountPaid.toLocaleString()}</span></span>
          <span className="mono">{progressPct}%</span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill progress-fill-${loan.status}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
