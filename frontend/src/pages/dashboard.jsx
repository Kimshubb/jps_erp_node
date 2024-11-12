import { Users, Wallet } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatsCard } from '../components/dashboard/StatsCard';
import { PaymentsTable } from '../components/dashboard/PaymentsTable';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { useDashboard } from '../hooks/useDashboard';

const DashboardPage = () => {
  const {
    dashboardData,
    isDashboardLoading,
    dashboardError,
    recentPayments,
    isPaymentsLoading,
    paymentsError,
    verifyPayment,
    isVerifying,
    refetchDashboard,
    refetchPayments,
  } = useDashboard();

  const stats = isDashboardLoading ? [] : [
    // ... Stats definition ...
  ];

  return (
    <DashboardLayout schoolName={schoolName} currentUser={currentUser}>
      <div className="space-y-6">
        {dashboardError && (
          <ErrorAlert 
            message="Failed to load dashboard data" 
            retry={refetchDashboard}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {paymentsError && (
          <ErrorAlert 
            message="Failed to load recent payments" 
            retry={refetchPayments}
          />
        )}

        <PaymentsTable
          payments={recentPayments}
          isLoading={isPaymentsLoading}
          onRefresh={refetchPayments}
          onVerify={verifyPayment}
          isVerifying={isVerifying}
        />
      </div>
    </DashboardLayout>
  );
};