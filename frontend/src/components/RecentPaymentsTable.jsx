import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Box } from '@mui/material';

const RecentPaymentsTable = ({ payments }) => {
  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Recent Payments
      </Typography>
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
            {payments.slice(0, 10).map((payment, index) => (
              <TableRow key={index}>
                <TableCell>{payment.student.fullName}</TableCell>
                <TableCell>{payment.student.grade.name}</TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>{payment.method === 'Mpesa' || payment.method === 'Bank' ? payment.code : 'N/A'}</TableCell>
                <TableCell>{payment.isVerified ? 'Verified' : 'Pending'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button variant="contained" color="primary" href="/all-payments">
          View All
        </Button>
      </Box>
    </Box>
  );
};

export default RecentPaymentsTable;

/** 
<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/all-payments" element={<AllPayments />} />
</Routes>*/