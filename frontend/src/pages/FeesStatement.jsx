import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    Button
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';

// Helper function to format currency
const formatCurrency = (amount) => `KES ${amount.toLocaleString()}`;

const FeeStatement = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatement = async () => {
            if (!studentId) return;
            
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get(`/api/payments/${studentId}/fee-statement`);
                if (response.data.success) {
                    setStatement(response.data.data);
                } else {
                    setError(response.data.error);
                }
            } catch (error) {
                setError(error.response?.data?.error || 'Failed to fetch fee statement. Try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatement();
    }, [studentId]);

    if (loading) {
        return (
            <Box className="flex justify-center items-center min-h-screen">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="p-4">
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="contained"
                    onClick={() => navigate(-1)}
                    className="mt-4"
                >
                    Back to Payments List
                </Button>
            </Box>
        );
    }

    return (
        <Box className="p-6 max-w-7xl mx-auto">
            <Box className="flex justify-between items-center mb-6">
                <Typography variant="h4">Fee Statement</Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate(-1)}
                >
                    Back to Payments List
                </Button>
            </Box>

            <Box className="space-y-6">
                {/* Student Information */}
                <Box className="bg-gray-50 p-4 rounded-lg">
                    <Typography variant="h6" className="mb-2">Student Information</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography><strong>Name:</strong> {statement?.studentInfo?.name}</Typography>
                            <Typography><strong>Grade:</strong> {statement?.studentInfo?.grade}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography><strong>Stream:</strong> {statement?.studentInfo?.stream}</Typography>
                            <Typography><strong>Status:</strong> {statement?.studentInfo?.status}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Payment History */}
                <Box>
                    <Typography variant="h6" className="mb-2">Payment History</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Reference</TableCell>
                                    <TableCell align="right">Balance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {statement?.payments.map((payment, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{payment.method}</TableCell>
                                        <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell>{payment.code || '-'}</TableCell>
                                        <TableCell align="right">{formatCurrency(payment.runningBalance)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Additional Fees Section */}
                {statement?.billing?.additionalFees?.length > 0 && (
                    <Box>
                        <Typography variant="h6" className="mb-2">Additional Fees</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {statement.billing.additionalFees.map((fee, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{fee.name}</TableCell>
                                            <TableCell align="right">{formatCurrency(fee.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell><strong>Total Additional Fees</strong></TableCell>
                                        <TableCell align="right">
                                            <strong>
                                                {formatCurrency(statement.billing.additionalFees.reduce(
                                                    (sum, fee) => sum + fee.amount, 
                                                    0
                                                ))}
                                            </strong>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* Summary Section */}
                <Box className="bg-gray-50 p-4 rounded-lg">
                    <Typography variant="h6" className="mb-2">Summary</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography><strong>Total Billed:</strong> {formatCurrency(statement?.summary?.totalBilled)}</Typography>
                            <Typography><strong>Total Paid:</strong> {formatCurrency(statement?.summary?.totalPaid)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography><strong>Carried Forward:</strong> {formatCurrency(statement?.summary?.carriedForwardBalance)}</Typography>
                            <Typography className="text-lg font-bold">
                                <strong>Current Balance:</strong> {formatCurrency(statement?.summary?.currentBalance)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default FeeStatement;