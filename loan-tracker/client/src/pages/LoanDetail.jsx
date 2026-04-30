import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import PaymentModal from '../components/PaymentModal.jsx';
import { RepaymentTrendChart } from '../components/TrendChart.jsx';
import apiClient from '../utils/api.js';
import {
  calculateEMI,
  getTotalInterest,
  getRepaymentTrend,
  getInterestAccumulation,
  isAheadOfSchedule,
} from '../utils/loanCalculations.js';
import './LoanDetail.css';

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchLoan = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/loans/${id}`);
      setLoan(response.data.data);
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading loan details...</div>
        </main>
      </div>
    );
  }

  if (!loan) return null;

  const emi = calculateEMI(loan.principal, loan.interestRate, loan.tenureMonths);
  const totalInterest = getTotalInterest(loan.principal, loan.interestRate, loan.tenureMonths);
  const totalOwed = loan.principal + totalInterest;
  const trendData = getRepaymentTrend(loan);
  const interestInfo = getInterestAccumulation(loan);
  const aheadOfSchedule = isAheadOfSchedule(loan);
  const progressPct = Math.min(100, Math.round((loan.amountPaid / totalOwed) * 100));

  const endDate = new Date(loan.startDate);
  endDate.setMonth(endDate.getMonth() + loan.tenureMonths);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <button className="back-link" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>

        <div className="loan-detail-header">
          <div>
            <h1 className="page-title">{loan.loanTitle}</h1>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', alignItems: 'center' }}>
              <span className={`badge badge-${loan.status}`}>{loan.status}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {aheadOfSchedule && loan.status === 'active'
                  ? '✓ Ahead of schedule'
                  : loan.status === 'active'
                  ? '⚠ Behind schedule'
                  : ''}
              </span>
            </div>
          </div>
          {loan.status !== 'completed' && (
            <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)}>
              + Record Payment
            </button>
          )}
        </div>

        <div className="detail-stats-grid">
          <div className="card stat-detail-card">
            <span className="stat-detail-label">Principal</span>
            <span className="stat-detail-value mono">PKR {loan.principal.toLocaleString()}</span>
          </div>
          <div className="card stat-detail-card">
            <span className="stat-detail-label">Monthly EMI</span>
            <span className="stat-detail-value mono accent-value">PKR {emi.toLocaleString()}</span>
          </div>
          <div className="card stat-detail-card">
            <span className="stat-detail-label">Interest Rate</span>
            <span className="stat-detail-value">{loan.interestRate}% per annum</span>
          </div>
          <div className="card stat-detail-card">
            <span className="stat-detail-label">Tenure</span>
            <span className="stat-detail-value">{loan.tenureMonths} months</span>
          </div>
          <div className="card stat-detail-card">
            <span className="stat-detail-label">Total Interest</span>
            <span className="stat-detail-value mono">PKR {totalInterest.toLocaleString()}</span>
          </div>
          <div className="card stat-detail-card">
            <span className="stat-detail-label">Total Payable</span>
            <span className="stat-detail-value mono">PKR {totalOwed.toLocaleString()}</span>
          </div>
          <div className="card stat-detail-card">
            <span className="stat-detail-label">Amount Paid</span>
            <span className="stat-detail-value mono success-value">
              PKR {loan.amountPaid.toLocaleString()} ({progressPct}%)
            </span>
          </div>
          <div className="card stat-detail-card">
            <span className="stat-detail-label">Loan End Date</span>
            <span className="stat-detail-value">
              {endDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="interest-breakdown card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="section-sub-title">Interest Accumulation</h3>
          <div className="interest-row">
            <div>
              <div className="interest-label">Interest Paid So Far</div>
              <div className="interest-value mono success-value">
                PKR {interestInfo.interestPaid.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="interest-label">Interest Remaining</div>
              <div className="interest-value mono" style={{ color: 'var(--warning)' }}>
                PKR {interestInfo.interestRemaining.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="interest-label">Total Interest</div>
              <div className="interest-value mono">
                PKR {interestInfo.totalInterest.toLocaleString()}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span>Repayment Progress</span>
              <span className="mono">{progressPct}%</span>
            </div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div
                className={`progress-fill progress-fill-${loan.status}`}
                style={{ width: `${progressPct}%`, height: '100%', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>

        {trendData.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <RepaymentTrendChart trendData={trendData} />
          </div>
        )}

        <div className="card payment-history">
          <h3 className="section-sub-title">Payment History</h3>
          {loan.payments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No payments recorded yet.</p>
          ) : (
            <div className="payment-list">
              {[...loan.payments].reverse().map((payment, idx) => (
                <div key={idx} className="payment-row">
                  <span className="payment-date">
                    {new Date(payment.date).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="payment-amount mono">
                    PKR {payment.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showPaymentModal && (
        <PaymentModal
          loanId={loan._id}
          loanTitle={loan.loanTitle}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(updatedLoan) => setLoan(updatedLoan)}
        />
      )}
    </div>
  );
}
