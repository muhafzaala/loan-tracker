import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import LoanCard from '../components/LoanCard.jsx';
import PaymentModal from '../components/PaymentModal.jsx';
import { MonthlyPaymentBarChart } from '../components/TrendChart.jsx';
import apiClient from '../utils/api.js';
import './Dashboard.css';

const STATUS_FILTERS = ['all', 'active', 'completed', 'overdue'];

export default function Dashboard() {
  const [loanList, setLoanList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [newLoanData, setNewLoanData] = useState({
    loanTitle: '',
    principal: '',
    interestRate: '',
    tenureMonths: '',
    startDate: '',
  });

  const fetchLoans = useCallback(async () => {
    setLoadingLoans(true);
    try {
      const response = await apiClient.get('/loans');
      setLoanList(response.data.data);
    } catch {
      // silently handled
    } finally {
      setLoadingLoans(false);
    }
  }, []);

  const fetchSummaryAndTrend = useCallback(async () => {
    try {
      const [summaryRes, trendRes] = await Promise.all([
        apiClient.get('/analytics/summary'),
        apiClient.get('/analytics/trend'),
      ]);
      setSummary(summaryRes.data.data);
      setMonthlyTrend(trendRes.data.data);
    } catch {
      // silently handled
    }
  }, []);

  useEffect(() => {
    fetchLoans();
    fetchSummaryAndTrend();
  }, [fetchLoans, fetchSummaryAndTrend]);

  const filteredLoans =
    activeFilter === 'all' ? loanList : loanList.filter((l) => l.status === activeFilter);

  const handleAddLoan = async () => {
    setAddError('');
    setAddLoading(true);
    try {
      const response = await apiClient.post('/loans', newLoanData);
      setLoanList((prev) => [response.data.data, ...prev]);
      setShowAddForm(false);
      setNewLoanData({ loanTitle: '', principal: '', interestRate: '', tenureMonths: '', startDate: '' });
      fetchSummaryAndTrend();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add loan.');
    } finally {
      setAddLoading(false);
    }
  };

  const handlePaymentSuccess = (updatedLoan) => {
    setLoanList((prev) => prev.map((l) => (l._id === updatedLoan._id ? updatedLoan : l)));
    fetchSummaryAndTrend();
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="dashboard-header">
          <h1 className="page-title">Dashboard</h1>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Loan'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-loan-form card">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              New Loan
            </h3>
            <div className="add-loan-grid">
              <div className="form-group">
                <label>Loan Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Car Loan, HEC Loan"
                  value={newLoanData.loanTitle}
                  onChange={(e) => setNewLoanData((p) => ({ ...p, loanTitle: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Principal (PKR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="500000"
                  value={newLoanData.principal}
                  onChange={(e) => setNewLoanData((p) => ({ ...p, principal: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="12"
                  value={newLoanData.interestRate}
                  onChange={(e) => setNewLoanData((p) => ({ ...p, interestRate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Tenure (Months)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="24"
                  value={newLoanData.tenureMonths}
                  onChange={(e) => setNewLoanData((p) => ({ ...p, tenureMonths: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newLoanData.startDate}
                  onChange={(e) => setNewLoanData((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
            </div>
            {addError && <div className="auth-error" style={{ marginTop: '0.5rem' }}>{addError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={handleAddLoan} disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add Loan'}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {summary && (
          <div className="summary-grid">
            <div className="summary-card card">
              <span className="summary-label">Active Loans</span>
              <span className="summary-value mono">{summary.totalActiveLoans}</span>
            </div>
            <div className="summary-card card">
              <span className="summary-label">Outstanding Principal</span>
              <span className="summary-value mono">PKR {summary.totalOutstandingPrincipal.toLocaleString()}</span>
            </div>
            <div className="summary-card card">
              <span className="summary-label">Avg Repayment Rate</span>
              <span className={`summary-value mono ${summary.avgRepaymentRate >= 100 ? 'value-good' : summary.avgRepaymentRate >= 70 ? 'value-warn' : 'value-bad'}`}>
                {summary.avgRepaymentRate}%
              </span>
              <span className="summary-sub">last 3 months</span>
            </div>
            <div className="summary-card card">
              <span className="summary-label">Total Loans</span>
              <span className="summary-value mono">{summary.totalLoans}</span>
            </div>
          </div>
        )}

        {monthlyTrend.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <MonthlyPaymentBarChart monthlyTrend={monthlyTrend} />
          </div>
        )}

        <div className="loans-section">
          <div className="loans-header">
            <h2 className="section-title">Your Loans</h2>
            <div className="filter-tabs">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`filter-tab ${activeFilter === f ? 'filter-tab-active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loadingLoans ? (
            <div className="empty-state">Loading loans...</div>
          ) : filteredLoans.length === 0 ? (
            <div className="empty-state">
              {activeFilter === 'all'
                ? 'No loans yet. Add your first loan above.'
                : `No ${activeFilter} loans found.`}
            </div>
          ) : (
            <div className="loans-grid">
              {filteredLoans.map((loan) => (
                <div key={loan._id} className="loan-card-wrapper">
                  <LoanCard loan={loan} />
                  <button
                    className="btn btn-ghost quick-pay-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentTarget(loan);
                    }}
                  >
                    + Payment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {paymentTarget && (
        <PaymentModal
          loanId={paymentTarget._id}
          loanTitle={paymentTarget.loanTitle}
          onClose={() => setPaymentTarget(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
