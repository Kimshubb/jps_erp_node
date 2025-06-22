import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress, 
  Box, 
  Alert,
  Pagination,
  Button,
  Stack,
  Typography
} from '@mui/material';
import { Download } from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';

const AllPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [exporting, setExporting] = useState(false);

  const fetchPayments = async (pageNumber) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/api/payments/all-recent-payments', {
        params: {
          page: pageNumber,
          limit: 10 // You can make this configurable if needed
        }
      });

      setPayments(response.data.data.payments);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(error.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Request CSV export from backend
      const response = await axiosInstance.get('/api/payments/export', {
        responseType: 'blob' // Important for handling file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `payments-${date}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting payments:', error);
      setError('Failed to export payments');
    } finally {
      setExporting(false);
    }
  };

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">All Payment Records</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExport}
          disabled={exporting || loading}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.student.fullName}</TableCell>
                <TableCell>{payment.student.grade.name}</TableCell>
                <TableCell>{payment.amount.toLocaleString()}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>
                  {payment.method === 'Mpesa' || payment.method === 'Bank' 
                    ? payment.code 
                    : 'N/A'}
                </TableCell>
                <TableCell>{payment.isVerified ? 'Verified' : 'Pending'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handlePageChange}
          disabled={loading}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default AllPayments;