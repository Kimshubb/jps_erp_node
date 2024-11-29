import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Button, Paper, Divider, CircularProgress } from '@mui/material';
import axiosInstance from '../utils/axiosInstance';

const AdditionalFees = () => {
  const { studentId } = useParams();
  const [associatedFees, setAssociatedFees] = useState([]);  // Initialize as empty array
  const [allFees, setAllFees] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const [associatedResponse, allFeesResponse] = await Promise.all([
        axiosInstance.get(`/api/students/${studentId}/additional-fees`),
        axiosInstance.get('/settings/additional-fees'),
      ]);
  
      console.log('Associated Fees:', associatedResponse.data); // Debug
      console.log('All Fees:', allFeesResponse.data.additionalFees); // Debug
  
      setAssociatedFees(Array.isArray(associatedResponse.data) ? associatedResponse.data : []);
      setAllFees(Array.isArray(allFeesResponse.data.additionalFees) ? allFeesResponse.data.additionalFees : []);
    } catch (error) {
      console.error('Error fetching fees:', error);
      setError('Failed to load fees. Please try again later.');
      setAssociatedFees([]);
      setAllFees([]);
    } finally {
      setLoading(false);
    }
  };
  

  const handleAssociateFee = async (feeId) => {
    try {
      setError(null);
      await axiosInstance.post(`/api/students/associate-student-with-fee`, {
        studentId,
        additionalFeeId: feeId,
      });
      fetchFees();
    } catch (error) {
      console.error('Error associating fee:', error);
      setError('Failed to associate fee. Please try again.');
    }
  };

  const handleUnsubscribeFee = async (feeId) => {
    try {
      setError(null);
      await axiosInstance.post(`/api/students/${studentId}/additional-fees`, {
        additionalFeeId: feeId,
        action: 'unsubscribe',
      });
      fetchFees();
    } catch (error) {
      console.error('Error unsubscribing fee:', error);
      setError('Failed to unsubscribe from fee. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Manage Fees for Student #{studentId}</Typography>
      
      {error && (
        <Paper sx={{ padding: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Paper sx={{ padding: 2, mb: 3 }}>
        <Typography variant="h6">Associated Fees</Typography>
        <List>
          {associatedFees.length === 0 ? (
            <ListItem>
              <ListItemText primary="No associated fees" />
            </ListItem>
          ) : (
            associatedFees.map((fee) => (
              <ListItem 
                key={fee.id} 
                secondaryAction={
                  <Button 
                    color="secondary" 
                    onClick={() => handleUnsubscribeFee(fee.id)}
                  >
                    Unsubscribe
                  </Button>
                }
              >
                <ListItemText 
                  primary={fee.feeName} 
                  secondary={`Amount: ${fee.amount}`}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6">Available Fees</Typography>
        <List>
          {allFees.length === 0 ? (
            <ListItem>
              <ListItemText primary="No available fees" />
            </ListItem>
          ) : (
            allFees
              .filter((fee) => !associatedFees.find((assocFee) => assocFee.id === fee.id))
              .map((fee) => (
                <ListItem 
                  key={fee.id} 
                  secondaryAction={
                    <Button 
                      color="primary" 
                      onClick={() => handleAssociateFee(fee.id)}
                    >
                      Add
                    </Button>
                  }
                >
                  <ListItemText 
                    primary={fee.feeName} 
                    secondary={`Amount: ${fee.amount}`}
                  />
                </ListItem>
              ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default AdditionalFees;