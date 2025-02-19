// frontend/src/pages/FeeReports.jsx
// This is the Fee Reports page component. It fetches and displays various fee reports for the school, including grade payment progress, payment method comparison, and term comparison. It uses the Axios library to make API requests to the backend.
import React, { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import { 
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';

const FeeReportsDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/payments/fee-reports');
      
      if (response.data?.success === false) {
        throw new Error(response.data.message || 'Failed to fetch fee reports');
      }
      
      setReportData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching fee reports:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch fee reports';
      setError(errorMessage);
      setLoading(false);
      
      // Check for specific error conditions
      if (errorMessage.includes('No active term')) {
        setError('No active term is set for the school. Please configure a current term in the School Settings.');
      }
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleRetry = () => {
    fetchReportData();
  };

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  // Calculate payment percentage for a grade with division by zero protection
  const calculatePaymentPercentage = (grade) => {
    try {
      const totalFees = (grade?.basicFees?.total || 0) + (grade?.additionalFees?.total || 0);
      const totalPayments = grade?.payments?.total || 0;
      
      if (totalFees === 0) return 0;
      return Math.min(100, Math.round((totalPayments / totalFees) * 100));
    } catch (err) {
      console.error('Error calculating payment percentage:', err);
      return 0;
    }
  };

  // Safely calculate percentage change with division by zero protection
  const calculatePercentageChange = (current, previous) => {
    try {
      if (!current) current = 0;
      if (!previous || previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return ((current - previous) / Math.abs(previous)) * 100;
    } catch (err) {
      console.error('Error calculating percentage change:', err);
      return 0;
    }
  };

  // Determine color based on payment percentage
  const getColorForPercentage = (percentage) => {
    if (percentage < 30) return 'error';
    if (percentage < 70) return 'warning';
    return 'success';
  };

  // Format currency
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-KE', { 
        style: 'currency', 
        currency: 'KES' 
      }).format(amount || 0);
    } catch (err) {
      console.error('Error formatting currency:', err);
      return `KES ${amount || 0}`;
    }
  };

  // Safely access nested properties
  const safelyGetNestedProp = (obj, path, defaultValue = null) => {
    try {
      return path.split('.').reduce((o, p) => (o || {})[p], obj) || defaultValue;
    } catch (err) {
      return defaultValue;
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box p={3}>
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRetry} startIcon={<RefreshIcon />}>
            Retry
          </Button>
        }
      >
        <Typography variant="subtitle1">{error}</Typography>
        {error.includes('No active term') && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please navigate to School Settings and set a current term before viewing fee reports.
          </Typography>
        )}
      </Alert>
    </Box>
  );
  
  if (!reportData) return (
    <Box p={3}>
      <Alert severity="info">
        No report data available. Please check if you have set up fee structures and payments.
      </Alert>
    </Box>
  );

  // Check if essential data structures exist
  const hasGradeDetails = Array.isArray(reportData?.gradeDetails) && reportData.gradeDetails.length > 0;
  const hasPaymentMethodComparison = reportData?.paymentMethodComparison && 
    Object.keys(reportData.paymentMethodComparison).length > 0;
  const hasTermComparison = reportData?.termComparison && 
    reportData.termComparison.currentTerm && reportData.termComparison.previousTerm;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        School Fee Reports
      </Typography>
      
      {/* Grade Payment Progress Section */}
      {hasGradeDetails ? (
        <Box mb={4}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
            Grade Payment Progress
          </Typography>
          
          {reportData.gradeDetails.map((grade) => {
            const paymentPercentage = calculatePaymentPercentage(grade);
            const progressColor = getColorForPercentage(paymentPercentage);
            const totalRequired = safelyGetNestedProp(grade, 'basicFees.total', 0) + 
                                  safelyGetNestedProp(grade, 'additionalFees.total', 0);
            const totalPaid = safelyGetNestedProp(grade, 'payments.total', 0);
            const balance = totalRequired - totalPaid;
            
            return (
              <Paper 
                key={grade.gradeId} 
                elevation={2} 
                sx={{ mb: 3, p: 2, borderRadius: 2 }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">{grade.gradeName || 'Unknown Grade'}</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {paymentPercentage}% Paid
                  </Typography>
                </Box>
                
                {/* Progress Bar */}
                <Box sx={{ width: '100%', mb: 3 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={paymentPercentage}
                    color={progressColor}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    mt={1}
                    fontSize="0.875rem"
                  >
                    {formatCurrency(totalPaid)} / {formatCurrency(totalRequired)}
                  </Box>
                </Box>
                
                {/* Detailed Fee Breakdown */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Basic Fees" 
                        titleTypographyProps={{ variant: 'subtitle1' }}
                        sx={{ pb: 0 }}
                      />
                      <CardContent sx={{ pt: 1 }}>
                        <List dense disablePadding>
                          <ListItem>
                            <ListItemText primary="Tuition" />
                            <Typography variant="body2">
                              {formatCurrency(safelyGetNestedProp(grade, 'basicFees.tuitionFee', 0))}
                            </Typography>
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Books" />
                            <Typography variant="body2">
                              {formatCurrency(safelyGetNestedProp(grade, 'basicFees.assBooks', 0))}
                            </Typography>
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Activity" />
                            <Typography variant="body2">
                              {formatCurrency(safelyGetNestedProp(grade, 'basicFees.activityFee', 0))}
                            </Typography>
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Diary" />
                            <Typography variant="body2">
                              {formatCurrency(safelyGetNestedProp(grade, 'basicFees.diaryFee', 0))}
                            </Typography>
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Others" />
                            <Typography variant="body2">
                              {formatCurrency(safelyGetNestedProp(grade, 'basicFees.others', 0))}
                            </Typography>
                          </ListItem>
                          <Divider sx={{ my: 1 }} />
                          <ListItem>
                            <ListItemText 
                              primary="Total Basic" 
                              primaryTypographyProps={{ fontWeight: 'bold' }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(safelyGetNestedProp(grade, 'basicFees.total', 0))}
                            </Typography>
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Additional Fees" 
                        titleTypographyProps={{ variant: 'subtitle1' }}
                        sx={{ pb: 0 }}
                      />
                      <CardContent sx={{ pt: 1 }}>
                        {safelyGetNestedProp(grade, 'additionalFees.items', []).length > 0 ? (
                          <List dense disablePadding>
                            {grade.additionalFees.items.map((fee, idx) => (
                              <ListItem key={idx}>
                                <ListItemText 
                                  primary={`${fee.name} (${fee.count} students)`}
                                />
                                <Typography variant="body2">
                                  {formatCurrency((fee.amount || 0) * (fee.count || 0))}
                                </Typography>
                              </ListItem>
                            ))}
                            <Divider sx={{ my: 1 }} />
                            <ListItem>
                              <ListItemText 
                                primary="Total Additional" 
                                primaryTypographyProps={{ fontWeight: 'bold' }}
                              />
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(safelyGetNestedProp(grade, 'additionalFees.total', 0))}
                              </Typography>
                            </ListItem>
                          </List>
                        ) : (
                          <Typography color="text.secondary" fontStyle="italic" pt={1}>
                            No additional fees
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Payment Summary" 
                        titleTypographyProps={{ variant: 'subtitle1' }}
                        sx={{ pb: 0 }}
                      />
                      <CardContent sx={{ pt: 1 }}>
                        <List dense disablePadding>
                          <ListItem>
                            <ListItemText primary="Total Required" />
                            <Typography variant="body2">
                              {formatCurrency(totalRequired)}
                            </Typography>
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Total Paid" />
                            <Typography variant="body2">
                              {formatCurrency(totalPaid)}
                            </Typography>
                          </ListItem>
                          <Divider sx={{ my: 1 }} />
                          <ListItem>
                            <ListItemText 
                              primary="Balance" 
                              primaryTypographyProps={{ 
                                fontWeight: 'bold', 
                                color: balance > 0 ? 'error.main' : 'success.main'
                              }}
                            />
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              color={balance > 0 ? 'error.main' : 'success.main'}
                            >
                              {formatCurrency(balance)}
                            </Typography>
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          No grade details available. Please check if fee structures have been set up.
        </Alert>
      )}
      
      {/* Payment Method Comparison */}
      {hasPaymentMethodComparison ? (
        <Box mb={4}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
            Payment Method Comparison
          </Typography>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={3}>
              {Object.entries(reportData.paymentMethodComparison).map(([method, data]) => {
                const current = safelyGetNestedProp(data, 'current', 0);
                const previous = safelyGetNestedProp(data, 'previous', 0);
                const change = calculatePercentageChange(current, previous);
                const isPositive = change >= 0;
                
                return (
                  <Grid item xs={12} md={4} key={method}>
                    <Card variant="outlined">
                      <CardHeader 
                        title={method} 
                        titleTypographyProps={{ variant: 'h6' }}
                      />
                      <CardContent>
                        <List dense>
                          <ListItem>
                            <ListItemText primary="Current Term" />
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(current)}
                            </Typography>
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Previous Term" />
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(previous)}
                            </Typography>
                          </ListItem>
                          <Divider sx={{ my: 1 }} />
                          <ListItem>
                            <Box display="flex" alignItems="center">
                              {isPositive ? (
                                <ArrowUpwardIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                              ) : (
                                <ArrowDownwardIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                              )}
                              <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                color={isPositive ? 'success.main' : 'error.main'}
                              >
                                {Math.abs(change).toFixed(1)}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                vs previous term
                              </Typography>
                            </Box>
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Payment method comparison data is not available. This may be the first term with payments.
        </Alert>
      )}
      
      {/* Term Comparison Summary */}
      {hasTermComparison ? (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
            Term Comparison
          </Typography>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Payment Totals" 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Current Term" />
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(safelyGetNestedProp(reportData, 'termComparison.currentTerm.totalPayments', 0))}
                        </Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Previous Term" />
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(safelyGetNestedProp(reportData, 'termComparison.previousTerm.totalPayments', 0))}
                        </Typography>
                      </ListItem>
                      <Divider sx={{ my: 1 }} />
                      <ListItem>
                        <ListItemText primary="Change" />
                        <Box display="flex" alignItems="center">
                          {(safelyGetNestedProp(reportData, 'termComparison.change', 0) >= 0) ? (
                            <ArrowUpwardIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                          )}
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            color={safelyGetNestedProp(reportData, 'termComparison.change', 0) >= 0 ? 'success.main' : 'error.main'}
                          >
                            {Math.abs(safelyGetNestedProp(reportData, 'termComparison.change', 0)).toFixed(1)}%
                          </Typography>
                        </Box>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Average Balance" 
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Current Term" />
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(safelyGetNestedProp(reportData, 'termComparison.currentTerm.averageBalance', 0))}
                        </Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Previous Term" />
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(safelyGetNestedProp(reportData, 'termComparison.previousTerm.averageBalance', 0))}
                        </Typography>
                      </ListItem>
                      <Divider sx={{ my: 1 }} />
                      <ListItem>
                        <ListItemText primary="Change" />
                        {safelyGetNestedProp(reportData, 'termComparison.previousTerm.averageBalance', 0) > 0 ? (
                          <Box display="flex" alignItems="center">
                            {(() => {
                              const currentAvg = safelyGetNestedProp(reportData, 'termComparison.currentTerm.averageBalance', 0);
                              const prevAvg = safelyGetNestedProp(reportData, 'termComparison.previousTerm.averageBalance', 0);
                              const balanceChange = calculatePercentageChange(currentAvg, prevAvg);
                              const isPositive = balanceChange >= 0;
                              // For balance, lower is better
                              const Icon = isPositive ? ArrowUpwardIcon : ArrowDownwardIcon;
                              const color = isPositive ? 'error' : 'success';
                              
                              return (
                                <>
                                  <Icon fontSize="small" color={color} sx={{ mr: 0.5 }} />
                                  <Typography 
                                    variant="body1" 
                                    fontWeight="bold"
                                    color={`${color}.main`}
                                  >
                                    {Math.abs(balanceChange).toFixed(1)}%
                                  </Typography>
                                </>
                              );
                            })()}
                          </Box>
                        ) : (
                          <Typography color="text.secondary">N/A</Typography>
                        )}
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      ) : (
        <Alert severity="info">
          Term comparison data is not available. This may be the first term with fee records.
        </Alert>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
      />
    </Container>
  );
};

export default FeeReportsDashboard;