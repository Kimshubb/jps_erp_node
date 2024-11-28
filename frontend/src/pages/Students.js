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
import { useNavigate } from 'react-router-dom';


const Students = () => {
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    //const [terms, setTerms] = useState([]);
    const [streams, setStreams] = useState([]);
    const [filters, setFilters] = useState({ grade: 'all', active: 'all', stream: 'all' });
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
                    stream: filters.stream,
                    active: filters.active,
                },
            });

            const { students, grades, streams, pagination: newPagination } = response.data;
            setStudents(students);
            setGrades(grades);
            setStreams(streams);
            setPagination(newPagination);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err.response?.data?.message || 'Failed to load students.');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page]);

    const handleToggleStudentStatus = async (studentId) => {
        try {
            const response = await axiosInstance.patch(`/api/students/${studentId}/toggle-status`);
            
            // Update the students list with the new active status
            setStudents(prevStudents => 
                prevStudents.map(student => 
                    student.id === studentId 
                    ? { 
                        ...student, 
                        active: response.data.student.active,
                        leftDate: response.data.student.leftDate
                    } 
                    : student
                )
            );
            console.log(response.data.student.active);
            console.log("Updated student:", response.data.student);
    
            // Optional: Show a success message
           // enqueueSnackbar(response.data.message, { variant: 'success' });
        } catch (error) {
            console.error('Error toggling student status:', error.response?.data || error); 
           /* enqueueSnackbar(
                error.response?.data?.message || 'Failed to update student status', 
                { variant: 'error' }
            );*/
        }
    };

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
    const navigate = useNavigate();

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

                {/* Term Filter */}
                <FormControl fullWidth>
                    <InputLabel>Active Status</InputLabel>
                    <Select
                        value={filters.term}
                        onChange={(e) => handleFilterChange('active', e.target.value)}
                    >
                        <MenuItem value="all">All Students</MenuItem>
                        <MenuItem value="true">Active</MenuItem>
                        <MenuItem value="false">Inactive</MenuItem>
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
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow 
                                            key={student.id}
                                            sx={{ backgroundColor: !student.active ? '#ffcccb' : 'inherit' }}
                                        >
                                            <TableCell>{student.id}</TableCell>
                                            <TableCell>{student.fullName}</TableCell>
                                            <TableCell>{student.guardianName}</TableCell>
                                            <TableCell>{student.contactNumber1}</TableCell>
                                            <TableCell>{student.contactNumber2 || 'N/A'}</TableCell>
                                            <TableCell>{student.gender}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    color={student.active ? "primary" : "error"}
                                                    onClick={() => handleToggleStudentStatus(student.id)}
                                                    sx={{ 
                                                        width: '100px', 
                                                        textTransform: 'capitalize' 
                                                    }}
                                                >
                                                    {student.active ? 'Active' : 'Inactive'}
                                                </Button>
                                        </TableCell>
                                        <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => navigate(`/students/${student.id}/edit`)}
                                                >
                                                    Edit
                                                </Button>
                                        </TableCell>
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
