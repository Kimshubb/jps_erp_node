import React, { useEffect, useState } from 'react';
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Pagination
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';

const StudentsPayments = () => {
    const [students, setStudents] = useState([]);
    const [terms, setTerms] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        grade: 'all',
        stream: 'all'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 15,
        total: 0,
        totalPages: 1
    });

    // Fetch Terms and Grades for Filters/Forms
    const fetchTermsAndGrades = async () => {
        try {
            const response = await axiosInstance.get('/api/grades-and-terms');
            setTerms(response.data.terms);
            setGrades(response.data.grades);
        } catch (err) {
            console.error('Error fetching terms and grades:', err);
            setError('Failed to fetch terms and grades.');
        }
    };

    // Fetch student payments
    const fetchPayments = async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get('/api/payments/view', {
                params: { 
                    page,
                    grade: filters.grade,
                    stream: filters.stream
                }
            });
            
            setStudents(response.data.students);
            setPagination(response.data.pagination);
        } catch (err) {
            console.error('Error fetching student payments:', err);
            setError('Failed to fetch student payments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchTermsAndGrades();
    }, []);

    // Fetch payments when page or filters change
    useEffect(() => {
        fetchPayments(pagination.page);
    }, [pagination.page, filters]);

    // Handle filter changes
    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ 
            ...prev, 
            [name]: value,
            // Reset stream if grade changes
            ...(name === 'grade' && value !== 'all' && { stream: 'all' })
        }));
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    };

    // Paginate results
    const handlePageChange = (event, value) => {
        setPagination((prev) => ({ ...prev, page: value }));
    };

    // Get streams for the selected grade
    const getStreamsForGrade = (gradeId) => {
        return gradeId === 'all' 
            ? [] 
            : grades.find(g => g.id === parseInt(gradeId))?.streams || [];
    };

    return (
        <Container>
            <h2>Student Payments</h2>
            {error && <Alert severity="error">{error}</Alert>}
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                {/* Grade Filter */}
                <FormControl fullWidth>
                    <InputLabel>Grade</InputLabel>
                    <Select
                        value={filters.grade}
                        onChange={(e) => handleFilterChange('grade', e.target.value)}
                    >
                        <MenuItem value="all">All Grades</MenuItem>
                        {grades.map((grade) => (
                            <MenuItem key={grade.id} value={grade.id.toString()}>
                                {grade.name}
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
                        disabled={filters.grade === 'all'}
                    >
                        <MenuItem value="all">All Streams</MenuItem>
                        {getStreamsForGrade(filters.grade).map((stream) => (
                            <MenuItem key={stream.id} value={stream.id.toString()}>
                                {stream.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student Name</TableCell>
                                <TableCell>Grade</TableCell>
                                <TableCell>Stream</TableCell>
                                <TableCell>Total Paid (KES)</TableCell>
                                <TableCell>Balance (KES)</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.fullName}</TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell>{student.stream}</TableCell>
                                    <TableCell>{student.totalPaid}</TableCell>
                                    <TableCell>{student.balance}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => window.location.href = `/receipt/${student.id}`}
                                        >
                                            View Fee Statement
                                        </Button>
                                    </TableCell>
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