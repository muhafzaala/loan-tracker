import { useState } from 'react';
import apiClient from '../utils/api.js';
import './PaymentModal.css';

export default function PaymentModal({ loanId, loanTitle, onClose, onSuccess }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setErrorMsg('Enter a valid payment amount.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.put(`/loans/${loanId}/payment`, { amount });
      onSuccess(response.data.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Record Payment</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-subtitle">Loan: <strong>{loanTitle}</strong></p>

        <div className="form-group">
          <label>Payment Amount (PKR)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 15000"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            autoFocus
            min="1"
          />
          {errorMsg && <span className="error-msg">{errorMsg}</span>}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Recording...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
