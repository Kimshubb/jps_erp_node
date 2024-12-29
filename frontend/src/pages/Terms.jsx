import React, { useEffect, useState } from 'react';
import { Box, Button, Container, TextField, Typography, Grid2 } from '@mui/material';
import axiosInstance from '../utils/axiosInstance';
import { useForm, Controller } from 'react-hook-form';

const Terms = () => {
    const [terms, setTerms] = useState([]);
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            term_id: null,
            name: '',
            year: '',
            startDate: '',
            endDate: '',
            current: false,
        },
    });

    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        try {
            const response = await axiosInstance.get('/settings/terms');
            setTerms(response.data.terms);
        } catch (error) {
            console.error('Failed to fetch terms:', error);
            alert('Error fetching terms.');
        }
    };

    const onSubmit = async (data) => {
        try {
            const response = await axiosInstance.post('/settings/terms', data);
            alert(response.data.message);
            reset();
            fetchTerms();
        } catch (error) {
            console.error('Error submitting term:', error);
            alert(error.response?.data?.error || 'Error managing term.');
        }
    };

    const editTerm = (term) => {
        reset({
            term_id: term.id,
            name: term.name,
            year: term.year,
            startDate: term.startDate.split('T')[0],
            endDate: term.endDate.split('T')[0],
            current: term.current,
        });
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Manage Terms
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} mb={4}>
                <Grid2 container spacing={2}>
                    <Grid2 item xs={12} sm={6}>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Name is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Name"
                                    fullWidth
                                    required
                                />
                            )}
                        />
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <Controller
                            name="year"
                            control={control}
                            rules={{ required: 'Year is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Year"
                                    type="number"
                                    fullWidth
                                    required
                                />
                            )}
                        />
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <Controller
                            name="startDate"
                            control={control}
                            rules={{ required: 'Start date is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Start Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    required
                                />
                            )}
                        />
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <Controller
                            name="endDate"
                            control={control}
                            rules={{ required: 'End date is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="End Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    required
                                />
                            )}
                        />
                    </Grid2>
                </Grid2>
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Save Term
                </Button>
            </Box>
            <Typography variant="h5" gutterBottom>
                Existing Terms
            </Typography>
            {terms.map((term) => (
                <Box key={term.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc' }}>
                    <Typography>
                        <strong>{term.name}</strong> ({term.year})
                    </Typography>
                    <Typography>
                        {term.startDate.split('T')[0]} to {term.endDate.split('T')[0]}
                    </Typography>
                    <Typography>Current: {term.current ? 'Yes' : 'No'}</Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => editTerm(term)}
                    >
                        Edit
                    </Button>
                </Box>
            ))}
        </Container>
    );
};

export default Terms;