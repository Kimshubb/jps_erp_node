import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'teacher', // Default role
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/settings/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handle form submission to create a new user
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axiosInstance.post('/settings/new-user', formData);
            setSuccess(response.data.message);
            setFormData({
                username: '',
                email: '',
                role: 'teacher',
                password: '',
            });
            fetchUsers(); // Refresh users list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Toggle user activation status
    const toggleUserStatus = async (userId) => {
        try {
            const response = await axiosInstance.patch(`/settings/users/${userId}/toggle-status`);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, isActive: response.data.isActive } : user
                )
            );
        } catch (err) {
            setError('Failed to update user status. Please try again.');
        }
    };

    return (
        <div className="container mt-4">
            <h2>User Management</h2>

            {/* Success/Error Messages */}
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* User Creation Form */}
            <form onSubmit={handleFormSubmit} className="mb-4">
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        className="form-control"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Role</label>
                    <select
                        name="role"
                        className="form-control"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="teacher">Teacher</option>
                        <option value="bursar">Bursar</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create User'}
                </button>
            </form>

            {/* Users List */}
            <h3>Existing Users</h3>
            {loading ? (
                <p>Loading users...</p>
            ) : users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                                <td>
                                    <button
                                        className={`btn btn-${
                                            user.isActive ? 'danger' : 'success'
                                        } btn-sm`}
                                        onClick={() => toggleUserStatus(user.id)}
                                    >
                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UsersManagement;
