import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Alert
} from '@mui/material';
import { 
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';

const FeeReportsDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/payments/fee-reports');
        setReportData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch fee reports');
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Calculate payment percentage for a grade with division by zero protection
  const calculatePaymentPercentage = (grade) => {
    const totalFees = grade.basicFees.total + grade.additionalFees.total;
    const totalPayments = grade.payments.total;
    
    if (totalFees === 0) return 0;
    return Math.min(100, Math.round((totalPayments / totalFees) * 100));
  };

  // Safely calculate percentage change with division by zero protection
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0 || previous === null || previous === undefined) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  // Determine color based on payment percentage
  const getColorForPercentage = (percentage) => {
    if (percentage < 30) return 'error';
    if (percentage < 70) return 'warning';
    return 'success';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES' 
    }).format(amount || 0);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box p={3}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );
  
  if (!reportData) return (
    <Box p={3}>
      <Alert severity="info">No report data available</Alert>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        School Fee Reports
      </Typography>
      
      {/* Grade Payment Progress Section */}
      <Box mb={4}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
          Grade Payment Progress
        </Typography>
        
        {reportData.gradeDetails.map((grade) => {
          const paymentPercentage = calculatePaymentPercentage(grade);
          const progressColor = getColorForPercentage(paymentPercentage);
          const totalRequired = grade.basicFees.total + grade.additionalFees.total;
          const balance = totalRequired - grade.payments.total;
          
          return (
            <Paper 
              key={grade.gradeId} 
              elevation={2} 
              sx={{ mb: 3, p: 2, borderRadius: 2 }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">{grade.gradeName}</Typography>
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
                  {formatCurrency(grade.payments.total)} / {formatCurrency(totalRequired)}
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
                            {formatCurrency(grade.basicFees.tuitionFee || 0)}
                          </Typography>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Books" />
                          <Typography variant="body2">
                            {formatCurrency(grade.basicFees.assBooks || 0)}
                          </Typography>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Activity" />
                          <Typography variant="body2">
                            {formatCurrency(grade.basicFees.activityFee || 0)}
                          </Typography>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Diary" />
                          <Typography variant="body2">
                            {formatCurrency(grade.basicFees.diaryFee || 0)}
                          </Typography>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Others" />
                          <Typography variant="body2">
                            {formatCurrency(grade.basicFees.others || 0)}
                          </Typography>
                        </ListItem>
                        <Divider sx={{ my: 1 }} />
                        <ListItem>
                          <ListItemText 
                            primary="Total Basic" 
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(grade.basicFees.total)}
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
                      {grade.additionalFees.items.length > 0 ? (
                        <List dense disablePadding>
                          {grade.additionalFees.items.map((fee, idx) => (
                            <ListItem key={idx}>
                              <ListItemText 
                                primary={`${fee.name} (${fee.count} students)`}
                              />
                              <Typography variant="body2">
                                {formatCurrency(fee.amount * fee.count)}
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
                              {formatCurrency(grade.additionalFees.total)}
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
                            {formatCurrency(grade.payments.total)}
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
      
      {/* Payment Method Comparison */}
      <Box mb={4}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
          Payment Method Comparison
        </Typography>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
          <Grid container spacing={3}>
            {Object.entries(reportData.paymentMethodComparison).map(([method, data]) => {
              const change = calculatePercentageChange(data.current, data.previous);
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
                            {formatCurrency(data.current)}
                          </Typography>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Previous Term" />
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(data.previous)}
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
      
      {/* Term Comparison Summary */}
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
                        {formatCurrency(reportData.termComparison.currentTerm.totalPayments)}
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Previous Term" />
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(reportData.termComparison.previousTerm.totalPayments)}
                      </Typography>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItem>
                      <ListItemText primary="Change" />
                      <Box display="flex" alignItems="center">
                        {reportData.termComparison.change >= 0 ? (
                          <ArrowUpwardIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                        ) : (
                          <ArrowDownwardIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                        )}
                        <Typography 
                          variant="body1" 
                          fontWeight="bold"
                          color={reportData.termComparison.change >= 0 ? 'success.main' : 'error.main'}
                        >
                          {reportData.termComparison.change.toFixed(1)}%
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
                        {formatCurrency(reportData.termComparison.currentTerm.averageBalance)}
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Previous Term" />
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(reportData.termComparison.previousTerm.averageBalance)}
                      </Typography>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItem>
                      <ListItemText primary="Change" />
                      {reportData.termComparison.previousTerm.averageBalance > 0 ? (
                        <Box display="flex" alignItems="center">
                          {(() => {
                            const balanceChange = calculatePercentageChange(
                              reportData.termComparison.currentTerm.averageBalance,
                              reportData.termComparison.previousTerm.averageBalance
                            );
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
    </Container>
  );
};

export default FeeReportsDashboard;