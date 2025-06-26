// src/pages/PatientDashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate here

const PatientDashboard = () => {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const [patientProfile, setPatientProfile] = useState(null);
    const [riskReport, setRiskReport] = useState(null);
    const [screenings, setScreenings] = useState([]);
    const [error, setError] = useState('');

    const navigate = useNavigate(); // Get the navigate function here

    useEffect(() => {
        const fetchPatientData = async () => {
            if (isAuthenticated && user && user.user_type === 'patient' && user.id) {
                setError('');
                try {
                    // Fetch patient profile
                    const profileResponse = await api.get(`patients/${user.id}/`);
                    setPatientProfile(profileResponse.data);

                    // Fetch risk report
                    const riskResponse = await api.get(`patients/${user.id}/risk-report/`);
                    setRiskReport(riskResponse.data);

                    // Fetch screening history
                    const screeningsResponse = await api.get(`screenings/?patient=${profileResponse.data.user.id}`);
                    setScreenings(screeningsResponse.data);

                } catch (err) {
                    console.error('Error fetching patient data:', err);
                    setError('Failed to load patient data. Please try again.');
                    // Handle specific error codes, e.g., 403 Forbidden for unauthorized access
                }
            }
        };

        if (!loading) { // Only fetch if authentication state is loaded
            fetchPatientData();
        }
    }, [isAuthenticated, user, loading]);

    // Handle logout, passing the navigate function
    const handleLogout = () => {
        logout(navigate); // Pass navigate to the logout function
    };

    if (loading) {
        return <div style={styles.loading}>Loading user data...</div>;
    }

    if (!isAuthenticated || user.user_type !== 'patient') {
        return <div style={styles.unauthorized}>Please log in as a patient to view this page.</div>;
    }

    return (
        <div style={styles.dashboardContainer}>
            <div style={styles.sidebar}>
                <h3 style={styles.sidebarTitle}>FemTrack AI</h3>
                <nav style={styles.nav}>
                    <a href="#dashboard" style={styles.navItem}>Dashboard</a>
                    <a href="#risk-report" style={styles.navItem}>My Risk Report</a>
                    <a href="#schedule-screening" style={styles.navItem}>Schedule Screening</a>
                    <a href="#my-costs" style={styles.navItem}>My Costs</a>
                    <a href="#appointments" style={styles.navItem}>Appointments</a>
                    {/* Updated onClick to use handleLogout */}
                    <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                </nav>
            </div>
            <div style={styles.mainContent}>
                <h1 style={styles.greeting}>Welcome, {user.first_name || user.username}!</h1>
                {error && <p style={styles.errorText}>{error}</p>}

                <section id="dashboard" style={styles.section}>
                    <h2>Patient Dashboard Overview</h2>
                    <div style={styles.cardContainer}>
                        <div style={styles.card}>
                            <h3>Your Current Risk Level</h3>
                            <p style={styles.riskLevel}>{riskReport ? riskReport.risk_level : 'N/A'}</p>
                            <p>Based on your latest assessment.</p>
                        </div>
                        <div style={styles.card}>
                            <h3>Next Screening</h3>
                            <p>Schedule your next appointment for timely detection.</p>
                            <button style={styles.actionButton}>Schedule Now</button>
                        </div>
                        <div style={styles.card}>
                            <h3>Screening History</h3>
                            <p>{screenings.length} previous screenings recorded.</p>
                            <button style={styles.actionButton}>View History</button>
                        </div>
                    </div>
                </section>

                <section id="risk-report" style={styles.section}>
                    <h2>My Risk Report</h2>
                    {riskReport ? (
                        <div style={styles.detailCard}>
                            <p><strong>Overall Risk:</strong> {riskReport.risk_level}</p>
                            <p><strong>Last Screening Date:</strong> {riskReport.last_screening_date || 'N/A'}</p>
                            {/* Add more detailed risk factors if available in the serializer */}
                        </div>
                    ) : (
                        <p>No detailed risk report available.</p>
                    )}
                </section>

                <section id="appointments" style={styles.section}>
                    <h2>Appointment History</h2>
                    {screenings.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Type</th>
                                    <th style={styles.th}>HPV Test</th>
                                    <th style={styles.th}>Pap Smear</th>
                                    <th style={styles.th}>Recommended Action</th>
                                    <th style={styles.th}>Assessed Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {screenings.map(s => (
                                    <tr key={s.id}>
                                        <td style={styles.td}>{new Date(s.screening_date).toLocaleDateString()}</td>
                                        <td style={styles.td}>{s.screening_type}</td>
                                        <td style={styles.td}>{s.hpv_test_result}</td>
                                        <td style={styles.td}>{s.pap_smear_result}</td>
                                        <td style={styles.td}>{s.recommended_action}</td>
                                        <td style={styles.td}>{s.assessment_risk_level}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No screening records found.</p>
                    )}
                </section>
                {/* Placeholder sections for other features */}
                <section id="schedule-screening" style={styles.section}>
                    <h2>Schedule New Screening</h2>
                    <p>Form to schedule a new screening will go here.</p>
                </section>
                <section id="my-costs" style={styles.section}>
                    <h2>My Costs & Financial Transparency</h2>
                    <p>Information about cost estimates and financing options will go here.</p>
                </section>
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
        flexGrow: 1, // Allows nav to push logout button to bottom if content fills
    },
    navItem: {
        color: '#fff',
        textDecoration: 'none',
        padding: '10px 15px',
        marginBottom: '10px',
        borderRadius: '5px',
        transition: 'background-color 0.3s ease',
    },
    navItemHover: {
        backgroundColor: '#495057',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: 'auto', // Pushes button to the bottom
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    card: {
        backgroundColor: '#e9ecef',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
    },
    riskLevel: {
        fontSize: '2em',
        fontWeight: 'bold',
        color: '#007bff',
    },
    actionButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    detailCard: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '5px',
        border: '1px solid #ddd',
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

export default PatientDashboard;