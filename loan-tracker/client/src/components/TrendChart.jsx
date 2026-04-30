import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './TrendChart.css';

const chartTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '0.82rem',
};

export function RepaymentTrendChart({ trendData }) {
  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Repayment Trend — Actual vs Expected</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
          <Line
            type="monotone"
            dataKey="expected"
            stroke="#334155"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Expected"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={{ fill: '#14b8a6', r: 3 }}
            name="Actual"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyPaymentBarChart({ monthlyTrend }) {
  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Monthly Payments</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Bar dataKey="totalPaid" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Amount Paid" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
