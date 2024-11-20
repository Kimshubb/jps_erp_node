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

const Students = () => {
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [terms, setTerms] = useState([]);
    const [streams, setStreams] = useState([]);
    const [filters, setFilters] = useState({ grade: 'all', term: 'all', stream: 'all' });
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch students data from API
    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get('/api/students/view-students', {
                params: {
                    page: pagination.page,
                    grade: filters.grade,
                    term: filters.term,
                    stream: filters.stream,
                },
            });

            const { students, grades, terms, streams, pagination: newPagination } = response.data;
            setStudents(students);
            setGrades(grades);
            setTerms(terms);
            setStreams(streams);
            setPagination(newPagination);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.response?.data?.message || 'Failed to load students.');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    };

    // Handle page changes
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
                        <MenuItem value="all">All Terms</MenuItem>
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

            {/* Loading and Error States */}
            {error && <Alert severity="error">{error}</Alert>}
            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Student List */}
                    {students.length === 0 ? (
                        <Typography variant="h6" align="center" mt={4}>
                            No students found.
                        </Typography>
                    ) : (
                        <TableContainer component={Paper} sx={{ mt: 4 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Guardian Name</TableCell>
                                        <TableCell>Primary Contact</TableCell>
                                        <TableCell>Secondary Contact</TableCell>
                                        <TableCell>Gender</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.id}</TableCell>
                                            <TableCell>{student.fullName}</TableCell>
                                            <TableCell>{student.guardianName}</TableCell>
                                            <TableCell>{student.contactNumber1}</TableCell>
                                            <TableCell>{student.contactNumber2 || 'N/A'}</TableCell>
                                            <TableCell>{student.gender}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
                        <Box mx={2}>Page {pagination.page} of {pagination.totalPages}</Box>
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
