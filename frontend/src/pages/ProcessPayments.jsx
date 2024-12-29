import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Paper,
    Autocomplete,
    CircularProgress,
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';
import { navigate, useNavigate } from 'react-router-dom';

const ProcessPayment = () => {
    const [formData, setFormData] = useState({
        student_id: '',
        amount: '',
        method: '',
        code: '',
    });
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null);
    const [studentOptions, setStudentOptions] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'method' && value === 'Cash') {
            setFormData((prev) => ({ ...prev, code: '' })); // Clear code for Cash
        }
    };

    // Fetch students based on input
    const handleSearch = async (event, value) => {
        if (!value) {
            setStudentOptions([]);
            return;
        }

        setSearchLoading(true);
        try {
            console.log('Searching for student:', value);
            const response = await axiosInstance.get('/api/search-student', {
                params: { q: value }, 
            });
            console.log('Search results:', response.data);
            setStudentOptions(response.data || []);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Failed to fetch students. Please try again.');
        } finally {
            setSearchLoading(false);
        }
    };

    // Handle student selection
    const handleStudentSelect = (event, value) => {
        if (value) {
            setFormData((prev) => ({
                ...prev,
                studentId: value.id,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                studentId: '',
            }));
        }
    };

    // Handle form submission
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const response = await axiosInstance.post('/api/payments/new', formData);
            setSuccess(response.data.message);
            setStudentInfo(response.data.payment);

            // Reset form
            setFormData({
                studentId: '',
                amount: '',
                method: '',
                code: '',
            });
            setStudentOptions([]);
            if (response.data.redirectUrl) {
                navigate(response.data.redirectUrl);
                console.log('Redirecting to:', response.data.redirectUrl);
            } else {
                console.log('No redirect URL provided');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while processing payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box my={4}>
                <Typography variant="h4" gutterBottom>
                    Process Fee Payment
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Paper elevation={3} sx={{ p: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Autocomplete
                            options={studentOptions}
                            getOptionLabel={(option) => `${option.name} (${option.id})`}
                            onInputChange={handleSearch}
                            onChange={handleStudentSelect}
                            loading={searchLoading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Student"
                                    placeholder="Enter student name or ID"
                                    margin="normal"
                                    fullWidth
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />

                        <TextField
                            fullWidth
                            label="Amount"
                            name="amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            margin="normal"
                            inputProps={{ min: 1 }} // Prevent negative or zero values
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Payment Method</InputLabel>
                            <Select
                                name="method"
                                value={formData.method}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="Cash">Cash</MenuItem>
                                <MenuItem value="Mpesa">M-Pesa</MenuItem>
                                <MenuItem value="Bank">Bank</MenuItem>
                            </Select>
                        </FormControl>

                        {formData.method && formData.method !== 'Cash' && (
                            <TextField
                                fullWidth
                                label={`${formData.method} Transaction Code`}
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                margin="normal"
                            />
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading || !formData.studentId} // Disable if no student selected
                            sx={{ mt: 3 }}
                        >
                            {loading ? 'Processing...' : 'Process Payment'}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default ProcessPayment;
