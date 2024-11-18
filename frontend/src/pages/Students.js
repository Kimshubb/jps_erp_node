import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid2,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';
import debounce from 'lodash/debounce';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [terms, setTerms] = useState([]);
  const [streams, setStreams] = useState([]);
  const [filters, setFilters] = useState({ grade: 'all', term: 'all', stream: 'all' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced Fetch Students Function
  const fetchStudents = debounce(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/students/view-students', {
        params: {
          page: pagination.page,
          grade: filters.grade,
          term: filters.term,
          stream: filters.stream,
        },
      });

      const { students, grades, terms, streams, pagination } = response.data;
      setStudents(students);
      setGrades(grades);
      setTerms(terms);
      setStreams(streams);
      setPagination(pagination);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, 300); // Debounce API calls by 300ms

  // Effect to Fetch Data
  useEffect(() => {
    fetchStudents();
  }, [filters, pagination.page]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Students</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => (window.location.href = '/students/add-student')}
        >
          Add New Student
        </Button>
      </Box>

      <Grid2 container spacing={3} mb={4}>
        {/* Grade Filter */}
        <Grid2 item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Grade</InputLabel>
            <Select
              value={filters.grade}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
            >
              <MenuItem value="all">All Grades</MenuItem>
              {grades.map((grade) => (
                <MenuItem key={grade.id} value={grade.id}>
                  {grade.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>

        {/* Term Filter */}
        <Grid2 item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Term</InputLabel>
            <Select
              value={filters.term}
              onChange={(e) => handleFilterChange('term', e.target.value)}
            >
              <MenuItem value="all">All Terms</MenuItem>
              {terms.map((term) => (
                <MenuItem key={term.id} value={term.id}>
                  {term.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>

        {/* Stream Filter */}
        <Grid2 item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Stream</InputLabel>
            <Select
              value={filters.stream}
              onChange={(e) => handleFilterChange('stream', e.target.value)}
            >
              <MenuItem value="all">All Streams</MenuItem>
              {streams.map((stream) => (
                <MenuItem key={stream.id} value={stream.id}>
                  {stream.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>
      </Grid2>

      {/* Error Handling */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Loading Indicator */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Empty Results Message */}
          {students.length === 0 ? (
            <Typography variant="h6" align="center" mt={4}>
              No students found.
            </Typography>
          ) : (
            <Grid2 container spacing={3}>
              {students.map((student) => (
                <Grid2 item xs={12} md={6} lg={4} key={student.id}>
                  <Box border="1px solid #ddd" borderRadius={4} p={2} boxShadow={1}>
                    <Typography variant="h6">{student.fullName}</Typography>
                    <Typography>Grade: {student.grade?.name || 'N/A'}</Typography>
                    <Typography>Stream: {student.stream?.name || 'N/A'}</Typography>
                    <Typography>Current Term: {student.currentTerm?.name || 'N/A'}</Typography>
                  </Box>
                </Grid2>
              ))}
            </Grid2>
          )}

          {/* Pagination Controls */}
          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="outlined"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Box mx={2} display="flex" alignItems="center">
              Page {pagination.page} of {pagination.totalPages}
            </Box>
            <Button
              variant="outlined"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Students;
