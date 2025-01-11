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
    Card,
    CardContent,
    LinearProgress,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { Alert, Snackbar } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';

const AssignSubjectsPage = () => {
    const [grades, setGrades] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedStream, setSelectedStream] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Enhanced filtering states
    const [filterGrade, setFilterGrade] = useState('');
    const [filterStream, setFilterStream] = useState('');
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [teacherLessonLoad, setTeacherLessonLoad] = useState(null);

    // State for assignment removal
    const [assignmentToRemove, setAssignmentToRemove] = useState(null);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await axiosInstance.get('/api/teachers/subject-allocation');
            setGrades(data.grades);
            setTeachers(data.teachers);
            
            // Find Playgroup and set default filters
            const playgroupGrade = data.grades.find(grade => 
                grade.name.toLowerCase() === 'playgroup'
            );

            if (playgroupGrade && playgroupGrade.streams.length > 0) {
                const firstStream = playgroupGrade.streams[0];
                
                // Set default filters to Playgroup and its first stream
                setFilterGrade(playgroupGrade.id);
                setFilterStream(firstStream.id);

                // Filter assignments for Playgroup's first stream
                const filtered = data.grades
                    .filter(grade => grade.id === playgroupGrade.id)
                    .flatMap(grade => 
                        grade.streams
                            .filter(stream => stream.id === firstStream.id)
                            .flatMap(stream => stream.subjectAssignments)
                    );

                setFilteredAssignments(filtered);
            } else {
                // Fallback if no Playgroup found
                const allAssignments = data.grades.flatMap(grade => 
                    grade.streams.flatMap(stream => stream.subjectAssignments)
                );
                setFilteredAssignments(allAssignments);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setErrorMessage('Failed to fetch subject allocation data.');
        }
    };

    const handleFilterAssignments = () => {
        // If no filters are set, return all assignments
        if (!filterGrade && !filterStream) {
            const allAssignments = grades.flatMap(grade => 
                grade.streams.flatMap(stream => stream.subjectAssignments)
            );
            setFilteredAssignments(allAssignments);
            return;
        }

        // Filter logic with optional grade and stream filters
        const filtered = grades
            .filter(grade => !filterGrade || grade.id === filterGrade)
            .flatMap(grade => 
                grade.streams
                    .filter(stream => !filterStream || stream.id === filterStream)
                    .flatMap(stream => stream.subjectAssignments)
            );

        setFilteredAssignments(filtered);
    };

    const handleAssignSubjects = async () => {
        if (!selectedTeacher || !selectedStream || selectedSubjects.length === 0) {
            setErrorMessage('Please select a teacher, stream, and at least one subject.');
            return;
        }

        const streamSubjectAssignments = selectedSubjects.map((subjectId) => ({
            streamId: parseInt(selectedStream),
            subjectId: parseInt(subjectId),
        }));

        try {
            const { data } = await axiosInstance.post('/api/teachers/assign-subjects', {
                teacherId: parseInt(selectedTeacher),
                streamSubjectAssignments,
            });
            
            // Update lesson load
            setTeacherLessonLoad({
                total: data.teacher.totalLessonsPerWeek,
                max: 30
            });

            setSuccessMessage('Subjects successfully assigned!');
            fetchData(); // Refresh assignments
        } catch (err) {
            console.error('Error assigning subjects:', err);
            const errorMessage = err.response?.data?.error || 'Failed to assign subjects.';
            setErrorMessage(errorMessage);

            // Handle specific lesson load error
            if (err.response?.data?.currentLessons !== undefined) {
                setTeacherLessonLoad({
                    current: err.response.data.currentLessons,
                    requested: err.response.data.requestedLessons,
                    max: 30
                });
            }
        }
    };

    const handleRemoveAssignment = async () => {
        if (!assignmentToRemove || !assignmentToRemove.stream?.id || !assignmentToRemove.subject?.id) {
            setErrorMessage('Invalid assignment data');
            return;
        }
        
        try {
            const { data } = await axiosInstance.post('/api/teachers/remove-subject-assignment', {
                streamId: assignmentToRemove.stream.id,
                subjectId: assignmentToRemove.subject.id
            });
            
            setSuccessMessage('Subject assignment removed successfully.');
            await fetchData();
            
            setRemoveDialogOpen(false);
            setAssignmentToRemove(null);
        } catch (err) {
            console.error('Error removing assignment:', err);
            setErrorMessage(
                err.response?.data?.error || 
                'Failed to remove subject assignment.'
            );
        }
    };

    const renderLessonLoadIndicator = () => {
        if (!teacherLessonLoad) return null;

        const { total, current, requested, max = 30 } = teacherLessonLoad;
        const progressValue = Math.min((total || current || 0) / max * 100, 100);

        return (
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Lesson Load
                    </Typography>
                    <Grid2 container spacing={2} alignItems="center">
                        <Grid2 item xs={12}>
                            <Tooltip 
                                title={`${total || current || 0} out of ${max} lessons per week`}
                                placement="top"
                            >
                                <LinearProgress 
                                    variant="determinate" 
                                    value={progressValue}
                                    color={progressValue > 80 ? 'warning' : 'primary'}
                                />
                            </Tooltip>
                        </Grid2>
                        <Grid2 item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                                {total || current || 0} / {max} lessons per week
                                {requested && ` (Requested: ${requested} lessons)`}
                            </Typography>
                        </Grid2>
                    </Grid2>
                </CardContent>
            </Card>
        );
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

    const renderRemoveAssignmentDialog = () => (
        <Dialog
            open={removeDialogOpen}
            onClose={() => setRemoveDialogOpen(false)}
        >
            <DialogTitle>Remove Subject Assignment</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to remove the assignment of 
                    {assignmentToRemove && ` ${assignmentToRemove.subject.name} `}
                    for 
                    {assignmentToRemove && ` ${assignmentToRemove.teacher.username}`}?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setRemoveDialogOpen(false)} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleRemoveAssignment} color="error" autoFocus>
                    Remove
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Assign Subjects to Teachers
            </Typography>

            {renderLessonLoadIndicator()}

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Grid2 container spacing={3}>
                    <Grid2 item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Teacher</InputLabel>
                            <Select
                                value={selectedTeacher}
                                onChange={(e) => {
                                    setSelectedTeacher(e.target.value);
                                    setTeacherLessonLoad(null);
                                }}
                            >
                                {teachers.map((teacher) => (
                                    <MenuItem key={teacher.id} value={teacher.id}>
                                        {teacher.username} ({teacher.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid2>

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

                    <Grid2 item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAssignSubjects}
                            disabled={!selectedTeacher || !selectedStream || selectedSubjects.length === 0}
                        >
                            Assign Subjects
                        </Button>
                    </Grid2>
                </Grid2>
            </Paper>

            {/* Filtering Section */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid2 container spacing={3}>
                    <Grid2 item xs={12} md={5}>
                        <FormControl fullWidth>
                            <InputLabel>Filter Grade</InputLabel>
                            <Select
                                value={filterGrade}
                                onChange={(e) => {
                                    const selectedGradeId = e.target.value;
                                    setFilterGrade(selectedGradeId);

                                    setFilterStream('');

                                    if (!selectedGradeId) {
                                        setFilteredAssignments(
                                            grades.flatMap(grade => 
                                                grade.streams.flatMap(stream => stream.subjectAssignments)
                                            )
                                        );
                                    }
                                }}
                            >
                                <MenuItem value="">All Grades</MenuItem>
                                {grades.map((grade) => (
                                    <MenuItem key={grade.id} value={grade.id}>
                                        {grade.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid2>

                    <Grid2 item xs={12} md={5}>
                        <FormControl fullWidth>
                            <InputLabel>Filter Stream</InputLabel>
                            <Select
                                value={filterStream}
                                onChange={(e) => setFilterStream(e.target.value)}
                                disabled={!filterGrade}
                            >
                                <MenuItem value="">All Streams</MenuItem>
                                {filterGrade && 
                                    grades.find(grade => grade.id === filterGrade)?.streams.map((stream) => (
                                        <MenuItem key={stream.id} value={stream.id}>
                                            {stream.name}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Grid2>

                    <Grid2 item xs={12} md={2}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleFilterAssignments}
                            startIcon={<FilterListIcon />}
                            fullWidth
                        >
                            Apply Filter
                        </Button>
                    </Grid2>
                </Grid2>
            </Paper>
            {/* Filtered Assignments Section */}
            <Typography variant="h4" gutterBottom>
                Current Subject Assignments
            </Typography>
            
            {renderFilteredAssignments()}

            {/* Dialogs and Snackbars */}
            {renderRemoveAssignmentDialog()}

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
            
                                    
                                    