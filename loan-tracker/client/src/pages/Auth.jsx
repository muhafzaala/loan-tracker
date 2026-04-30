import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../utils/api.js';
import './Auth.css';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, userToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userToken) navigate('/dashboard');
  }, [userToken, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg('');
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = activeTab === 'login' ? '/auth/login' : '/auth/signup';
      const payload =
        activeTab === 'login'
          ? { email: formData.email, password: formData.password }
          : formData;

      const response = await apiClient.post(endpoint, payload);
      const { token, user } = response.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back">← Back</Link>

      <div className="auth-box">
        <div className="auth-brand">
          <span style={{ color: 'var(--accent)', fontSize: '1.4rem' }}>◈</span>
          <span>LoanTrack</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'auth-tab-active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${activeTab === 'signup' ? 'auth-tab-active' : ''}`}
            onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
          >
            Create Account
          </button>
        </div>

        <div className="auth-form">
          {activeTab === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Ali Hassan"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="ali@example.com"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder={activeTab === 'signup' ? 'Min. 6 characters' : '••••••••'}
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <button
            className="btn btn-primary auth-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? activeTab === 'login' ? 'Signing in...' : 'Creating account...'
              : activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
