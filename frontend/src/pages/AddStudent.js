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
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';

const AddStudent = () => {
    const [formOptions, setFormOptions] = useState({
        grades: [],
        currentTerm: null,
    });
    const [availableStreams, setAvailableStreams] = useState([]);
    const [formData, setFormData] = useState({
        full_name: '',
        dob: '',
        gender: '',
        guardianName: '',
        contactNumber1: '',
        contactNumber2: '',
        cfBalance: '',
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
                console.log('Fetching form options...');

                const response = await axiosInstance.get('/api/students/add');
                console.log('API Response:', response.data);
                const { grades, streams, currentTerm } = response.data;

                // Map streams to corresponding grades for filtering
                const enrichedGrades = grades.map((grade) => ({
                    ...grade,
                    streams: streams.filter((stream) => stream.gradeId === grade.id),
                }));
                console.log('Enriched grades:', enrichedGrades);

                setFormOptions({
                    grades: enrichedGrades,
                    currentTerm,
                });

                console.log('Form options loaded:', { grades: enrichedGrades, streams, currentTerm });
            } catch (err) {
                console.error('Error fetching form options:', err);
                console.error('Error fetching form options:', err.response || err.message || err);
                setError('Failed to load form options. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFormOptions();
    }, []);

    // Update available streams when grade changes
    useEffect(() => {
        if (formData.grade_id) {
            console.log('Grade changed:', formData.grade_id);
            const selectedGrade = formOptions.grades.find(
                (grade) => grade.id === parseInt(formData.grade_id)
            );
            console.log('Selected grade:', selectedGrade);
            setAvailableStreams(selectedGrade?.streams || []);
            console.log('Available streams:', selectedGrade?.streams || []);

            // Reset stream selection if current stream doesn't belong to the new grade
            if (formData.stream_id) {
                const streamExists = selectedGrade?.streams.some(
                    (stream) => stream.id === parseInt(formData.stream_id)
                );
                if (!streamExists) {
                    console.warn('Selected stream does not belong to the new grade. Resetting...');
                    setFormData((prev) => ({ ...prev, stream_id: '' }));
                }
            }
        } else {
            console.log('Grade cleared. Resetting streams...');
            setAvailableStreams([]);
        }
    }, [formData.grade_id, formOptions.grades]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'grade_id' ? { stream_id: '' } : {}), // Reset stream if grade changes
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            console.log('Submitting form:', formData);
            const response = await axiosInstance.post('/api/students/add', formData);
            setSuccess(response.data.message);
            setFormData({
                fullName: '',
                dob: '',
                gender: '',
                guardianName: '',
                contactNumber1: '',
                contactNumber2: '',
                cfBalance: '',
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
                    name="fullName"
                    value={formData.fullName}
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
                    InputLabelProps={{ shrink: true }}
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
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 3 }}
                />
                <TextField
                    fullWidth
                    label="Contact Number 1"
                    name="contactNumber1"
                    value={formData.contact_number1}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 3 }}
                />
                <TextField
                    fullWidth
                    label="Contact Number 2"
                    name="contactNumber2"
                    value={formData.contactNumber2}
                    onChange={handleInputChange}
                    sx={{ mb: 3 }}
                />
                <TextField
                    fullWidth
                    label="Carry Forward Balance"
                    name="cfBalance"
                    value={formData.cfBalance || ''} // Default to an empty string
                    onChange={(e) => setFormData((prev) => ({ ...prev, cfBalance: e.target.value }))}
                    type="number"
                    placeholder="Enter carry forward balance (if any)"
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