import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AdditionalFeesPage = () => {
    const [fees, setFees] = useState([]);
    const [feeName, setFeeName] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch existing fees for the user's school
    const fetchFees = async () => {
        try {
            const response = await axiosInstance.get('/settings/additional-fees');
            setFees(response.data.additionalFees);
        } catch (error) {
            setError('Failed to fetch additional fees.');
        }
    };

    // Handle the form submission to create a new additional fee
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!feeName || !amount) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('/settings/additional-fees', {
                feeName,
                amount,
            });
            setFees((prevFees) => [...prevFees, response.data.additionalFee]);
            setFeeName('');
            setAmount('');
            setError('');
        } catch (err) {
            setError('Failed to create additional fee.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    return (
        <div className="container mt-4">
            <h2>Additional Fees</h2>

            {/* Error message */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Form to create a new additional fee */}
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="mb-3">
                    <label htmlFor="feeName" className="form-label">
                        Fee Name
                    </label>
                    <input
                        type="text"
                        id="feeName"
                        className="form-control"
                        value={feeName}
                        onChange={(e) => setFeeName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="amount" className="form-label">
                        Amount
                    </label>
                    <input
                        type="number"
                        id="amount"
                        className="form-control"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Additional Fee'}
                </button>
            </form>

            {/* List of existing additional fees */}
            <h3>Existing Fees</h3>
            {fees.length === 0 ? (
                <p>No additional fees defined yet.</p>
            ) : (
                <ul className="list-group">
                    {fees.map((fee) => (
                        <li key={fee.id} className="list-group-item d-flex justify-content-between align-items-center">
                            {fee.feeName} - ${fee.amount}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdditionalFeesPage;