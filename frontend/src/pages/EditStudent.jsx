import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Box,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from '../utils/axiosInstance';

const EditStudent = () => {
    const { studentId } = useParams(); // Get studentId from the route
    const navigate = useNavigate();   // For redirecting after submission
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [grades, setGrades] = useState([]);
    const [streams, setStreams] = useState([]);
    const [filteredStreams, setFilteredStreams] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        dob: null,
        gender: '',
        guardianName: '',
        contactNumber1: '',
        contactNumber2: '',
        gradeId: '',
        streamId: '',
    });

    // Fetch student, grades, and streams on component load
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/api/students/${studentId}`);
                const { student, grades, streams } = response.data;

                // Populate form data and filters
                setFormData({
                    ...student,
                    dob: new Date(student.dob),
                });
                setGrades(grades);
                setStreams(streams);

                // Filter streams based on the student's grade
                setFilteredStreams(streams.filter((stream) => stream.gradeId === student.gradeId));
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load student data');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [studentId]);

    // Update stream options when grade changes
    useEffect(() => {
        if (formData.gradeId) {
            setFilteredStreams(streams.filter((stream) => stream.gradeId === formData.gradeId));

            // Clear streamId if it's not valid for the selected grade
            if (!streams.find((stream) => stream.gradeId === formData.gradeId && stream.id === formData.streamId)) {
                setFormData((prev) => ({ ...prev, streamId: '' }));
            }
        }
    }, [formData.gradeId, streams]);

    // Handle input changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle date change
    const handleDateChange = (date) => {
        setFormData((prev) => ({
            ...prev,
            dob: date,
        }));
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);

            await axiosInstance.patch(`/api/students/${studentId}/update`, {
                ...formData,
                dob: formData.dob.toISOString().split('T')[0], // Convert date to string
            });

            navigate('/students'); // Redirect to student list after successful update
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update student');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Edit Student
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />

                        <ReactDatePicker
                            selected={formData.dob}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd"
                            customInput={
                                <TextField
                                    fullWidth
                                    label="Date of Birth"
                                    required
                                />
                            }
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Guardian Name"
                            name="guardianName"
                            value={formData.guardianName}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Primary Contact"
                            name="contactNumber1"
                            value={formData.contactNumber1}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Secondary Contact"
                            name="contactNumber2"
                            value={formData.contactNumber2}
                            onChange={handleChange}
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Grade</InputLabel>
                            <Select
                                name="gradeId"
                                value={formData.gradeId}
                                onChange={handleChange}
                            >
                                {grades.map((grade) => (
                                    <MenuItem key={grade.id} value={grade.id}>
                                        {grade.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>Stream</InputLabel>
                            <Select
                                name="streamId"
                                value={formData.streamId}
                                onChange={handleChange}
                                disabled={!formData.gradeId}
                            >
                                {filteredStreams.map((stream) => (
                                    <MenuItem key={stream.id} value={stream.id}>
                                        {stream.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/students')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Update Student
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default EditStudent;
