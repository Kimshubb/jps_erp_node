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
    Button,
    Modal
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '80vh',
    overflowY: 'auto',
};

const StudentsPayments = () => {
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [terms, setTerms] = useState([]);
    const [streams, setStreams] = useState([]);
    const [filters, setFilters] = useState({ grade: 'all', term: 'current', stream: 'all' });
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [open, setOpen] = useState(false);
    const [selectedStatement, setSelectedStatement] = useState(null);
    const [statementLoading, setStatementLoading] = useState(false);

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

    const handleViewStatement = async (studentId) => {
        setStatementLoading(true);
        setSelectedStatement(null);
        setOpen(true);

        try {
            console.log('Attempting to fetch statement for student:', studentId);
            const response = await axiosInstance.get(`/api/payments/student/${studentId}/fee-statement`);
            console.log('Full response:', response);
            if (response.data.success) {
                setSelectedStatement(response.data.data);
            } else {
                setSelectedStatement({ error: response.data.error });
            }
        } catch (error) {
            console.error('FULL Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data
            });
            setSelectedStatement({ 
                error: error.response?.data?.error || 'Failed to fetch fee statement. Try again later.' 
            });
        } finally {
            setStatementLoading(false);
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Student Payments
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Box display="flex" gap={2} mb={4}>
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
                                <TableCell>Actions</TableCell>
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
                                    <TableCell>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            onClick={() => handleViewStatement(student.id)}
                                        >
                                            View Statement
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

            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" gutterBottom>Fee Statement</Typography>
                    {statementLoading ? (
                        <CircularProgress />
                    ) : selectedStatement?.error ? (
                        <Alert severity="error">{selectedStatement.error}</Alert>
                    ) : (
                        <>
                            <Typography><strong>Student:</strong> {selectedStatement?.fullName}</Typography>
                            <Typography><strong>Grade:</strong> {selectedStatement?.grade}</Typography>
                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Amount (KES)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedStatement?.payments.map((payment, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{payment.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Typography sx={{ mt: 2 }}><strong>Total Paid:</strong> KES {selectedStatement?.totalPaid}</Typography>
                            <Typography><strong>Balance:</strong> KES {selectedStatement?.balance}</Typography>
                        </>
                    )}
                    <Button variant="contained" color="secondary" onClick={() => setOpen(false)} sx={{ mt: 2 }}>Close</Button>
                </Box>
            </Modal>
        </Container>
    );
};

export default StudentsPayments;
