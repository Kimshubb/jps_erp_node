// src/components/ViewAddfees.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Pagination,
  CircularProgress,
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ViewAddfees = () => {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    grades: [],
    streams: [],
  });
  const [filterValues, setFilterValues] = useState({
    gradeId: '',
    streamId: '',
    feeId: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalStudents: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filterValues, pagination.page]);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/payments/view-addfees'); // Fetch filters and metadata
      setFilters(response.data.filters);
    } catch (error) {
      console.error('Error fetching filters:', error);
      setError('Failed to load filters.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const { page } = pagination;
      const { gradeId, streamId, feeId } = filterValues;
  
      const response = await axiosInstance.get('/api/students/view-students', {
        params: {
          page,
          limit: pagination.limit,
          gradeId: gradeId || undefined,
          streamId: streamId || undefined,
          feeId: feeId || undefined,
        },
      });
  
      const { students, metadata } = response.data;
  
      setStudents(students);
  
      setPagination((prev) => ({
        ...prev,
        totalStudents: metadata?.totalStudents || 0, // Safe access
        totalPages: metadata?.totalPages || 1,       // Safe access
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilterValues((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }));
  };
  const navigate = useNavigate();

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        View Additional Fees for Students
      </Typography>

      {error && (
        <Paper sx={{ padding: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ padding: 2, mb: 3 }}>
        <Typography variant="h6">Filters</Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Select
            value={filterValues.gradeId}
            onChange={(e) => handleFilterChange('gradeId', e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">All Grades</MenuItem>
            {filters.grades.map((grade) => (
              <MenuItem key={grade.id} value={grade.id}>
                {grade.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={filterValues.streamId}
            onChange={(e) => handleFilterChange('streamId', e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">All Streams</MenuItem>
            {filters.streams
              .filter((stream) => !filterValues.gradeId || stream.gradeId === parseInt(filterValues.gradeId))
              .map((stream) => (
                <MenuItem key={stream.id} value={stream.id}>
                  {stream.name}
                </MenuItem>
              ))}
          </Select>

          <Select
            value={filterValues.feeId}
            onChange={(e) => handleFilterChange('feeId', e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">All Additional Fees</MenuItem>
            {/* Assuming `additionalFees` is preloaded */}
            {filters.additionalFees?.map((fee) => (
              <MenuItem key={fee.id} value={fee.id}>
                {fee.feeName}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Paper>

      {/* Students Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Stream</TableCell>
                <TableCell>Additional Fees Count</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No students found</TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.grade?.name}</TableCell>
                    <TableCell>{student.stream?.name}</TableCell>
                    <TableCell>{student.additionalFeesCount}</TableCell>
                    <TableCell>
                    <Button
                             variant="contained"
                            color="primary"
                            size='small'
                            onClick={() => navigate(`/students/${student.id}/add-fees`)}
                    >
                    View All
                    </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={pagination.totalPages}
          page={pagination.page}
          onChange={handlePageChange}
        />
      </Box>
    </Box>
  );
};

export default ViewAddfees;
