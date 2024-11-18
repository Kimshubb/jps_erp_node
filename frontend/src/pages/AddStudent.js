import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    Typography,
} from '@mui/material'; // Ensure MainLayout exists
import axiosInstance from '../utils/axiosInstance';

const AddStudent = () => {
    const [formOptions, setFormOptions] = useState({
        grades: [],
        currentTerm: null
    });
    const [availableStreams, setAvailableStreams] = useState([]);
    const [formData, setFormData] = useState({
        full_name: '',
        dob: '',
        gender: '',
        guardian_name: '',
        contact_number1: '',
        contact_number2: '',
        grade_id: '',
        stream_id: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch form options on component mount
    useEffect(() => {
        const fetchFormOptions = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axiosInstance.get('/api/students/add');
                const { grades, streams, currentTerm } = response.data;

                setFormOptions({
                    grades: grades.map(grade => ({
                        ...grade,
                        streams: streams.filter(stream => stream.gradeId === grade.id)
                    })),
                    currentTerm
                });

                console.log('Form options loaded:', { grades, streams, currentTerm });
            } catch (err) {
                console.error('Error fetching form options:', err);
                setError('Failed to load form options. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFormOptions();
    }, []);
    //Update available streams when grade changes
    useEffect(() => {
        if (formData.grade_id) {
            const selectedGrade = formOptions.grades.find(
                grade => grade.id === parseInt(formData.grade_id)
            );
            setAvailableStreams(selectedGrade?.streams || []);
            // Reset stream selection when grade changes
            if (formData.stream_id) {
                const streamExists = selectedGrade?.streams.some(
                    stream => stream.id === parseInt(formData.stream_id)
                );
                if (!streamExists) {
                    setFormData(prev => ({ ...prev, stream_id: '' }));
                }
            }
        } else {
            setAvailableStreams([]);
        }
    }, [formData.grade_id, formOptions.grades]);


    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Reset stream when grade changes
        if (name === 'grade_id') {
            setFormData(prev => ({ ...prev, [name]: value, stream_id: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.post('/api/students/add', formData);
            setSuccess(response.data.message);
            setFormData({
                full_name: '',
                dob: '',
                gender: '',
                guardian_name: '',
                contact_number1: '',
                contact_number2: '',
                grade_id: '',
                stream_id: '',
            });
            console.log('Student added:', response.data);
        } catch (err) {
            console.error('Error adding student:', err);
            setError(err.response?.data?.message || 'Failed to add student. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
            <Container>
                <Typography variant="h4" gutterBottom>
                    Add New Student
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 3 }}
                    />
                    <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }} //slotsProps
                        required
                        sx={{ mb: 3 }}
                    />
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Gender</InputLabel>
                        <Select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Guardian Name"
                        name="guardian_name"
                        value={formData.guardian_name}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 3 }}
                    />
                    <TextField
                        fullWidth
                        label="Contact Number 1"
                        name="contact_number1"
                        value={formData.contact_number1}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 3 }}
                    />
                    <TextField
                        fullWidth
                        label="Contact Number 2"
                        name="contact_number2"
                        value={formData.contact_number2}
                        onChange={handleInputChange}
                        sx={{ mb: 3 }}
                    />
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Grade</InputLabel>
                        <Select
                            name="grade_id"
                            value={formData.grade_id}
                            onChange={handleInputChange}
                            required
                        >
                            {formOptions.grades.map((grade) => (
                                <MenuItem key={grade.id} value={grade.id}>
                                    {grade.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Stream</InputLabel>
                        <Select
                            name="stream_id"
                            value={formData.stream_id}
                            onChange={handleInputChange}
                            required
                            disabled={!formData.grade_id}
                        >
                            {availableStreams.map((stream) => (
                                <MenuItem key={stream.id} value={stream.id}>
                                    {stream.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" color="primary" disabled={submitting} fullWidth>
                    {submitting ? 'Submitting...' : 'Add Student'}
                    </Button>
                </form>
            </Container>
    );
};

export default AddStudent;
