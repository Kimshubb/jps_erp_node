import React, { useEffect, useState, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Container,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Typography,
    Alert,
    Pagination,
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';

const StudentsPayments = () => {
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [terms, setTerms] = useState([]);
    const [streams, setStreams] = useState([]);
    const [filters, setFilters] = useState({ grade: 'all', term: 'current', stream: 'all' });
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStudentsPayments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get('/api/payments/view', {
                params: { 
                    page: pagination.page,
                    grade: filters.grade,
                    term: filters.term,
                    stream: filters.stream,
                }
            });

            const { students, filters: filterOptions, pagination: newPagination } = response.data;

            setStudents(students);
            setGrades(filterOptions.grades);
            setTerms(filterOptions.terms);
            setStreams(filterOptions.streams);
            setPagination(newPagination);
        } catch (err) {
            console.error('Error fetching student payments:', err);
            setError(err.response?.data?.message || 'Failed to load student payments.');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page]);

    useEffect(() => {
        fetchStudentsPayments();
    }, [fetchStudentsPayments]);

    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset to the first page
    };

    const handlePageChange = (event, value) => {
        setPagination((prev) => ({ ...prev, page: value }));
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Student Payments
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Box display="flex" gap={2} mb={4}>
                {/* Grade Filter */}
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

                {/* Term Filter */}
                <FormControl fullWidth>
                    <InputLabel>Term</InputLabel>
                    <Select
                        value={filters.term}
                        onChange={(e) => handleFilterChange('term', e.target.value)}
                    >
                        <MenuItem value="current">Current Term</MenuItem>
                        {terms.map((term) => (
                            <MenuItem key={term.id} value={term.id}>
                                {term.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Stream Filter */}
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
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Grade</TableCell>
                                <TableCell>Stream</TableCell>
                                <TableCell>Total Paid</TableCell>
                                <TableCell>Balance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.id}</TableCell>
                                    <TableCell>{student.fullName}</TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell>{student.stream}</TableCell>
                                    <TableCell>KES {student.totalPaid}</TableCell>
                                    <TableCell>KES {student.balance}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                sx={{ mt: 3 }}
            />
        </Container>
    );
};

export default StudentsPayments;
