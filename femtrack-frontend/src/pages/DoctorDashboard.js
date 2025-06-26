// src/pages/DoctorDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Correct path from pages to context
import api from '../services/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate here

const DoctorDashboard = () => {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const [summaryCounts, setSummaryCounts] = useState(null);
    const [patientList, setPatientList] = useState([]);
    const [error, setError] = useState('');

    const navigate = useNavigate(); // Get the navigate function here

    useEffect(() => {
        const fetchDoctorData = async () => {
            if (isAuthenticated && user && user.user_type === 'doctor') {
                setError('');
                try {
                    // Fetch summary counts for the dashboard cards
                    const countsResponse = await api.get('patients/summary-counts/');
                    setSummaryCounts(countsResponse.data);

                    // Fetch patient list for the table
                    const patientListResponse = await api.get('patients/for-doctor-dashboard/');
                    setPatientList(patientListResponse.data);

                } catch (err) {
                    console.error('Error fetching doctor data:', err);
                    setError('Failed to load doctor data. Please try again.');
                }
            }
        };

        if (!loading) {
            fetchDoctorData();
        }
    }, [isAuthenticated, user, loading]);

    // Handle logout, passing the navigate function
    const handleLogout = () => {
        logout(navigate); // Pass navigate to the logout function
    };

    if (loading) {
        return <div style={styles.loading}>Loading user data...</div>;
    }

    if (!isAuthenticated || user.user_type !== 'doctor') {
        return <div style={styles.unauthorized}>Please log in as a doctor to view this page.</div>;
    }

    return (
        <div style={styles.dashboardContainer}>
            <div style={styles.sidebar}>
                <h3 style={styles.sidebarTitle}>FemTrack AI</h3>
                <nav style={styles.nav}>
                    <a href="#dashboard" style={styles.navItem}>Dashboard</a>
                    <a href="#patients" style={styles.navItem}>Patients</a>
                    <a href="#assessment-review" style={styles.navItem}>Assessment Review</a>
                    <a href="#new-assessment" style={styles.navItem}>New Assessment</a>
                    <a href="#inventory" style={styles.navItem}>Inventory</a>
                    <a href="#cost-estimator" style={styles.navItem}>Cost Estimator</a>
                    <a href="#reports" style={styles.navItem}>Reports</a>
                    {/* Updated onClick to use handleLogout */}
                    <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                </nav>
            </div>
            <div style={styles.mainContent}>
                <h1 style={styles.greeting}>Welcome, Dr. {user.first_name || user.username}!</h1>
                {error && <p style={styles.errorText}>{error}</p>}

                <section id="dashboard" style={styles.section}>
                    <h2>Doctor Dashboard Overview</h2>
                    <div style={styles.cardContainer}>
                        <div style={styles.card}>
                            <h3>Total Patients</h3>
                            <p style={styles.count}>{summaryCounts ? summaryCounts.total_patients : '...'}</p>
                        </div>
                        <div style={styles.card}>
                            <h3>High Risk</h3>
                            <p style={{...styles.count, color: 'red'}}>{summaryCounts ? summaryCounts.high_risk : '...'}</p>
                        </div>
                        <div style={styles.card}>
                            <h3>Moderate Risk</h3>
                            <p style={{...styles.count, color: 'orange'}}>{summaryCounts ? summaryCounts.moderate_risk : '...'}</p>
                        </div>
                        <div style={styles.card}>
                            <h3>Low Risk</h3>
                            <p style={{...styles.count, color: 'green'}}>{summaryCounts ? summaryCounts.low_risk : '...'}</p>
                        </div>
                        <div style={styles.card}>
                            <h3>Pending Assessments</h3>
                            <p style={{...styles.count, color: 'gray'}}>{summaryCounts ? summaryCounts.pending_assessment : '...'}</p>
                        </div>
                    </div>
                </section>

                <section id="patients" style={styles.section}>
                    <h2>Patient Assessments</h2>
                    {patientList.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Patient ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Risk Level</th>
                                    <th style={styles.th}>Last Assessment</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientList.map(patient => (
                                    <tr key={patient.user}>
                                        <td style={styles.td}>{patient.patient_id}</td>
                                        <td style={styles.td}>{patient.name}</td>
                                        <td style={styles.td}>{patient.email}</td>
                                        <td style={styles.td}>{patient.risk_level}</td>
                                        <td style={styles.td}>{patient.last_assessment_date ? new Date(patient.last_assessment_date).toLocaleDateString() : 'N/A'}</td>
                                        <td style={styles.td}><button style={styles.viewButton}>View</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No patients found.</p>
                    )}
                </section>

                {/* Placeholder sections for other features */}
                <section id="new-assessment" style={styles.section}>
                    <h2>New Patient Assessment</h2>
                    <p>Form for doctors to create new patient assessments will go here.</p>
                </section>
                <section id="inventory" style={styles.section}>
                    <h2>Inventory Management</h2>
                    <p>Real-time tracking of screening tools and supplies.</p>
                </section>
                {/* ... other sections like Cost Estimator, Reports ... */}
            </div>
        </div>
    );
};

const styles = {
    dashboardContainer: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
    },
    sidebar: {
        width: '250px',
        backgroundColor: '#343a40',
        color: '#fff',
        padding: '20px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
    },
    sidebarTitle: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#61dafb', // React blue
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    navItem: {
        color: '#fff',
        textDecoration: 'none',
        padding: '10px 15px',
        marginBottom: '10px',
        borderRadius: '5px',
        transition: 'background-color 0.3s ease',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: 'auto',
    },
    mainContent: {
        flexGrow: 1,
        padding: '30px',
    },
    greeting: {
        color: '#333',
        marginBottom: '30px',
    },
    section: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        marginBottom: '20px',
    },
    cardContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // Smaller cards for more items
        gap: '20px',
        marginTop: '20px',
    },
    card: {
        backgroundColor: '#e9ecef',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
    },
    count: {
        fontSize: '2em',
        fontWeight: 'bold',
        color: '#007bff',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '15px',
    },
    th: {
        backgroundColor: '#007bff',
        color: '#fff',
        padding: '10px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
    },
    td: {
        padding: '10px',
        borderBottom: '1px solid #eee',
        textAlign: 'left',
    },
    viewButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        padding: '5px 10px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    loading: {
        fontSize: '1.2em',
        textAlign: 'center',
        paddingTop: '50px',
    },
    unauthorized: {
        fontSize: '1.2em',
        textAlign: 'center',
        paddingTop: '50px',
        color: 'red',
    },
    errorText: {
        color: 'red',
        marginBottom: '15px',
        textAlign: 'center',
    }
};

export default DoctorDashboard;