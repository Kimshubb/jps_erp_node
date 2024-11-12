import React from 'react';
import { RefreshCw } from 'lucide-react';

export const PaymentsTable = ({
  payments,
  isLoading,
  onRefresh,
  onVerify,
  isVerifying
}) => {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Recent Payments</h5>
        <button
          className="btn btn-primary btn-sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="mr-2" />
          Refresh
        </button>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index}>
                  <td>{payment.student}</td>
                  <td>{payment.grade}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.method}</td>
                  <td>{payment.code || 'N/A'}</td>
                  <td>{payment.verified ? 'Verified' : 'Pending'}</td>
                  <td>
                    {!payment.verified && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onVerify(payment.id)}
                        disabled={isVerifying}
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};