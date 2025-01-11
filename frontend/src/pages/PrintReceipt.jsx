import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const PrintReceipt = () => {
    const { studentId, paymentId } = useParams(); // Get studentId and paymentId from the route
    const navigate = useNavigate();
    const [receiptData, setReceiptData] = useState(null); // Store the receipt data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const response = await axiosInstance.get(`/api/payments/student/${studentId}/receipt/${paymentId}`);
                const data = response.data;
                setReceiptData(data); // Set the receipt data
            } catch (err) {
                console.error('Error fetching receipt:', err);
                setError(err.message); // Set the error message
            } finally {
                setLoading(false); // End loading state
            }
        };

        fetchReceipt();
    }, [studentId, paymentId]);

    if (loading) return <p>Loading receipt...</p>; // Show a loading message
    if (error) return <p>Error: {error}</p>; // Show an error message

    const { school, student, payment, qrCode } = receiptData;

    return (
        <div>
            <h1>Receipt</h1>

            {/* School Information */}
            <div>
                <h2>{school.name}</h2>
                <p>Contact: {school.contacts}</p>
            </div>

            {/* Student Information */}
            <div>
                <h3>Student Details</h3>
                <p>
                    <strong>Name:</strong> {student.name} <br />
                    <strong>ID:</strong> {student.id}
                </p>
            </div>

            {/* Payment Details */}
            <div>
                <h3>Payment Details</h3>
                <p>
                    <strong>Method:</strong> {payment.method} <br />
                    <strong>Amount Paid:</strong> KES {payment.amount} <br />
                    <strong>Balance:</strong> KES {payment.balance} <br />
                    <strong>Payment Date:</strong> {new Date(payment.payDate).toLocaleDateString()}
                </p>
            </div>

            {/* QR Code */}
            {qrCode && (
                <div>
                    <h3>Fee Statement</h3>
                    <img src={qrCode} alt="Fee Statement QR Code" style={{ width: '150px' }} />
                </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: '20px' }}>
                <button onClick={() => window.print()}>Print Receipt</button>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );
};

export default PrintReceipt;
