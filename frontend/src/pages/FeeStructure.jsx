import React, { useEffect, useState, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    CircularProgress,
    Alert,
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';

const ManageFeeStructures = () => {
    const [feeStructures, setFeeStructures] = useState([]);
    const [terms, setTerms] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false); // Modal state
    const [formSubmitting, setFormSubmitting] = useState(false); // Form submission state

    // Form data for Add/Edit Fee Structure
    const [formData, setFormData] = useState({
        fee_structure_id: null,
        grade: '',
        term_id: '',
        tuition_fee: '',
        ass_books: '',
        diary_fee: '',
        activity_fee: '',
        others: '',
    });

    const [filters, setFilters] = useState({
        term: 'all',
        grade: 'all',
    });

    // Fetch data on component mount
    useEffect(() => {
        fetchFeeStructures();
        fetchTermsAndGrades();
    }, [filters]);

    // Fetch Fee Structures with Filters
    const fetchFeeStructures = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get('/api/settings/fee-structure', {
                params: filters,
            });

            setFeeStructures(response.data.feeStructures);
        } catch (err) {
            console.error('Error fetching fee structures:', err);
            setError('Failed to fetch fee structures. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchFeeStructures();
    }, [fetchFeeStructures]); // fetchFeeStructures is now a dependency


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

    // Handle Modal Open for Add/Edit
    const handleOpen = (feeStructure = null) => {
        setFormData({
            fee_structure_id: feeStructure?.id || null,
            grade: feeStructure?.grade?.id || '',
            term_id: feeStructure?.term?.id || '',
            tuition_fee: feeStructure?.tuitionFee || '',
            ass_books: feeStructure?.assBooks || '',
            diary_fee: feeStructure?.diaryFee || '',
            activity_fee: feeStructure?.activityFee || '',
            others: feeStructure?.others || '',
        });
        setOpen(true);
    };

    // Handle Modal Close
    const handleClose = () => {
        setOpen(false);
        setFormData({
            fee_structure_id: null,
            grade: '',
            term_id: '',
            tuition_fee: '',
            ass_books: '',
            diary_fee: '',
            activity_fee: '',
            others: '',
        });
    };

    // Handle Form Submission
    const handleSubmit = async () => {
        try {
            setFormSubmitting(true);
            setError(null);

            const payload = { 
                ...formData,
                tuition_fee: parseFloat(formData.tuition_fee),
                diary_fee: parseFloat(formData.diary_fee),
                activity_fee: parseFloat(formData.activity_fee),
                ass_books: parseFloat(formData.ass_books),
                others: parseFloat(formData.others) || 0
            };
            await axiosInstance.post('/api/settings/fee-structure', payload);

            fetchFeeStructures(); // Refresh Fee Structures
            handleClose(); // Close Modal
        } catch (err) {
            console.error('Error saving fee structure:', err);
            setError('Failed to save fee structure. Please check your inputs.');
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <Container>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">Manage Fee Structures</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                    New Fee Structure
                </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Filters */}
                    <Box display="flex" gap={2} mb={4}>
                        <FormControl fullWidth>
                            <InputLabel>Term</InputLabel>
                            <Select
                                value={filters.term}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, term: e.target.value }))
                                }
                            >
                                <MenuItem value="all">All Terms</MenuItem>
                                {terms.map((term) => (
                                    <MenuItem key={term.id} value={term.id}>
                                        {term.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Grade</InputLabel>
                            <Select
                                value={filters.grade}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, grade: e.target.value }))
                                }
                            >
                                <MenuItem value="all">All Grades</MenuItem>
                                {grades.map((grade) => (
                                    <MenuItem key={grade.id} value={grade.id}>
                                        {grade.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Fee Structures Table */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Term</TableCell>
                                    <TableCell>Tuition Fee</TableCell>
                                    <TableCell>Activity Fee</TableCell>
                                    <TableCell>Diary Fee</TableCell>
                                    <TableCell>AssBook Fee</TableCell>
                                    <TableCell>Others</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feeStructures.map((fee) => (
                                    <TableRow key={fee.id}>
                                        <TableCell>{fee.grade?.name}</TableCell>
                                        <TableCell>{fee.term?.name}</TableCell>
                                        <TableCell>{fee.tuitionFee}</TableCell>
                                        <TableCell>{fee.activityFee}</TableCell>
                                        <TableCell>{fee.diaryFee}</TableCell>
                                        <TableCell>{fee.assBooks}</TableCell>
                                        <TableCell>{fee.others}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => handleOpen(fee)}
                                                sx={{ mr: 1 }}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Add/Edit Fee Structure Modal */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {formData.fee_structure_id ? 'Edit Fee Structure' : 'New Fee Structure'}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Grade</InputLabel>
                        <Select
                            name="grade"
                            value={formData.grade}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, grade: e.target.value }))
                            }
                        >
                            {grades.map((grade) => (
                                <MenuItem key={grade.id} value={grade.id}>
                                    {grade.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Term</InputLabel>
                        <Select
                            name="term_id"
                            value={formData.term_id}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, term_id: e.target.value }))
                            }
                        >
                            {terms.map((term) => (
                                <MenuItem key={term.id} value={term.id}>
                                    {term.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Tuition Fee"
                        name="tuition_fee"
                        value={formData.tuition_fee}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, tuition_fee: e.target.value }))
                        }
                        type="number"
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Diary Fee"
                        name="diary_fee"
                        value={formData.diary_fee}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, diary_fee: e.target.value }))
                        }
                        type="number"
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="AssBook Fee"
                        name="ass_books"
                        value={formData.ass_books}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, ass_books: e.target.value }))
                        }
                        type="number"
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Others"
                        name="others"
                        value={formData.others}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, others: e.target.value }))
                        }
                        type="number"
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Activity Fee"
                        name="activity_fee"
                        value={formData.activity_fee}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, activity_fee: e.target.value }))
                        }
                        type="number"
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary" disabled={formSubmitting}>
                        {formSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ManageFeeStructures;
