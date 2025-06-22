import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
    Box,
    Typography,
    Button,
    Grid2,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { Alert, Snackbar } from '@mui/material';

const AssignSubjectsPage = () => {
    const [grades, setGrades] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedStream, setSelectedStream] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch grades, streams, and teachers
    const fetchData = async () => {
        try {
            const { data } = await axiosInstance.get('/api/teachers/subject-allocation');
            setGrades(data.grades);
            setTeachers(data.teachers);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleAssignSubjects = async () => {
        if (!selectedTeacher || !selectedStream || selectedSubjects.length === 0) {
            setErrorMessage('Please select a teacher, stream, and at least one subject.');
            return;
        }

        const streamSubjectAssignments = selectedSubjects.map((subjectId) => ({
            streamId: selectedStream,
            subjectId,
        }));

        try {
            const { data } = await axiosInstance.post('/api/teachers/assign-subjects', {
                teacherId: selectedTeacher,
                streamSubjectAssignments,
            });
            setSuccessMessage('Subjects successfully assigned!');
            fetchData(); // Refresh assignments
        } catch (err) {
            console.error('Error assigning subjects:', err);
            setErrorMessage('Failed to assign subjects.');
        }
    };
    const renderFilteredAssignments = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Grade</TableCell>
                        <TableCell>Stream</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Assigned Teacher</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredAssignments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                No assignments found
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredAssignments.map((assignment, index) => {
                            // Find the grade and stream for this assignment
                            const grade = grades.find(g => 
                                g.streams.some(s => 
                                    s.subjectAssignments.includes(assignment)
                                )
                            );
                            const stream = grade?.streams.find(s => 
                                s.subjectAssignments.includes(assignment)
                            );
                                
                            return (
                                <TableRow key={index}>
                                    <TableCell>{grade?.name || 'N/A'}</TableCell>
                                    <TableCell>{stream?.name || 'N/A'}</TableCell>
                                    <TableCell>{assignment.subject.name}</TableCell>
                                    <TableCell>
                                        {assignment.teacher
                                            ? `${assignment.teacher.username} (${assignment.teacher.email})`
                                             : 'Not Assigned'}
                                    </TableCell>
                                    <TableCell>
                                        {assignment.teacher && (
                                            <Tooltip title="Remove Assignment">
                                                <Button 
                                                    color="error" 
                                                    size="small"
                                                    onClick={() => {
                                                        setAssignmentToRemove(assignment);
                                                        setRemoveDialogOpen(true);
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </Button>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
             </Table>
        </TableContainer>
    );

    const renderGradeAssignments = () => {
        return grades.map((grade) => (
            <Box key={grade.id} mb={4}>
                <Typography variant="h5" gutterBottom>
                    {grade.name}
                </Typography>
                {grade.streams.map((stream) => (
                    <Box key={stream.id} ml={2} mb={2}>
                        <Typography variant="h6">
                            Stream: {stream.name}
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Assigned Teacher</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stream.subjectAssignments.map((assignment) => (
                                        <TableRow key={assignment.subject.id}>
                                            <TableCell>{assignment.subject.name}</TableCell>
                                            <TableCell>
                                                {assignment.teacher
                                                    ? `${assignment.teacher.username} (${assignment.teacher.email})`
                                                    : 'Not Assigned'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ))}
            </Box>
        ));
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Assign Subjects to Teachers
            </Typography>

            {/* Form to Assign Subjects */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Grid2 container spacing={3}>
                    <Grid2 item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Grade</InputLabel>
                            <Select
                                value={selectedGrade}
                                onChange={(e) => {
                                    setSelectedGrade(e.target.value);
                                    setSelectedStream('');
                                    setSelectedSubjects([]);
                                }}
                            >
                                {grades.map((grade) => (
                                    <MenuItem key={grade.id} value={grade.id}>
                                        {grade.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Stream</InputLabel>
                            <Select
                                value={selectedStream}
                                onChange={(e) => {
                                    setSelectedStream(e.target.value);
                                    setSelectedSubjects([]);
                                }}
                                disabled={!selectedGrade}
                            >
                                {grades
                                    .find((grade) => grade.id === selectedGrade)?.streams.map((stream) => (
                                        <MenuItem key={stream.id} value={stream.id}>
                                            {stream.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Subjects</InputLabel>
                            <Select
                                multiple
                                value={selectedSubjects}
                                onChange={(e) => setSelectedSubjects(e.target.value)}
                                renderValue={(selected) =>
                                    selected
                                        .map(
                                            (id) =>
                                                grades
                                                    .find((grade) => grade.id === selectedGrade)
                                                    ?.subjects.find((subject) => subject.id === id)?.name
                                        )
                                        .join(', ')
                                }
                                disabled={!selectedStream}
                            >
                                {grades
                                    .find((grade) => grade.id === selectedGrade)?.subjects.map((subject) => (
                                        <MenuItem key={subject.id} value={subject.id}>
                                            <Checkbox checked={selectedSubjects.includes(subject.id)} />
                                            <ListItemText primary={subject.name} />
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid2>

                    <Grid2 item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Teacher</InputLabel>
                            <Select
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                            >
                                {teachers.map((teacher) => (
                                    <MenuItem key={teacher.id} value={teacher.id}>
                                        {teacher.username} ({teacher.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid2>

                    <Grid2 item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAssignSubjects}
                        >
                            Assign Subjects
                        </Button>
                    </Grid2>
                </Grid2>
            </Paper>

            {/* Display Existing Assignments */}
            <Typography variant="h4" gutterBottom>
                Current Subject Assignments
            </Typography>
            {renderGradeAssignments()}

            {/* Snackbar for Success/Errors */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={4000}
                onClose={() => setSuccessMessage('')}
            >
                <Alert onClose={() => setSuccessMessage('')} severity="success">
                    {successMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={4000}
                onClose={() => setErrorMessage('')}
            >
                <Alert onClose={() => setErrorMessage('')} severity="error">
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AssignSubjectsPage;
