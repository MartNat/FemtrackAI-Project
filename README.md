FemTrack AI: Intelligent Cervical Cancer Care Platform
Project Overview
Cervical cancer remains a critical global health challenge. FemTrack AI is an innovative, AI-powered platform designed to revolutionize cervical cancer care by providing personalized risk prediction, optimizing real-time resource management, and ensuring financial transparency. This project was developed as a comprehensive solution to empower healthcare providers with actionable insights and equip patients with better access to timely, affordable care.

Problem Statement
Cervical cancer poses a significant threat to women, particularly in regions with limited access to timely screening, accurate risk assessment, and coordinated care. Key challenges include fragmented healthcare data, scarcity of diagnostic tools, gaps in care coordination, and financial barriers hindering timely interventions. The aim is to bridge these gaps by developing an AI-driven, comprehensive care template that offers precise predictive insights, optimizes medical resource allocation, and provides clear guidance and affordable care access, all while ensuring data security and user-friendly workflows.

Solution: FemTrack AI
FemTrack AI addresses these challenges by combining machine learning, real-time tracking, and financial transparency features:

Personalized Risk Prediction: Utilizes machine learning (currently rule-based for the prototype) to analyze patient data and generate personalized cervical cancer risk scores, offering clear insights to both providers and patients.

Customized Screening Schedules: Recommends appropriate screening intervals based on established national guidelines.

Real-time Resource Management: Tracks the availability of screening tools and supplies to help facilities prevent delays and optimize resource utilization (placeholder for future enhancement).

Financial Transparency: Provides upfront cost estimates and potential connections to financing options to improve affordability and clarity of care costs (placeholder for future enhancement).

Enhanced Care Coordination: Features automated patient reminders and intuitive dashboards for both patients and doctors to support seamless care coordination and improve follow-up rates.

Our 30-day hackathon prototype demonstrates these core functionalities with an intuitive interface, strong data security principles, and foundational clinical accuracy.

Key Features (Prototype)
User Authentication: Secure login and registration for both Patient and Doctor user types.

Patient Dashboard:

Displays personalized cervical cancer risk level.

Shows a summary of past screening records.

Provides links for scheduling new screenings and viewing cost estimates (placeholders).

Doctor Dashboard:

Overview of total patients and counts categorized by risk levels (High, Moderate, Low, Unknown/Pending).

Table displaying patient details, risk levels, and last assessment dates.

Sections for assessment review, new assessment creation, inventory management, and reports (placeholders).

Data Seeding: A custom Django management command to import and process patient data from a CSV file into the database.

Technologies Used
Backend (Django)
Python 3.x: The core programming language.

Django: High-level Python Web framework for rapid development.

Django REST Framework (DRF): Powerful toolkit for building Web APIs.

django-cors-headers: For handling Cross-Origin Resource Sharing (CORS) with the React frontend.

Database: Default SQLite (for development), easily configurable for PostgreSQL or MySQL for production.

Authentication: Token-based authentication using DRF's rest_framework.authtoken.

Frontend (React)
React.js: JavaScript library for building user interfaces.

React Router DOM: For declarative routing in the React application.

Axios: Promise-based HTTP client for making API requests to the Django backend.

React Context API: For global state management (e.g., authentication status).

CSS: Inline styling for rapid prototyping and clear visual separation of components.

Setup Instructions
Follow these steps to get the FemTrack AI project up and running on your local machine.

1. Prerequisites
Python 3.8+

Node.js and npm (or yarn)

2. Backend Setup (Django)
Clone the repository (or create the project structure as we did):

# If starting from scratch:
mkdir FemTrackAI_Backend
cd FemTrackAI_Backend

Create and activate a virtual environment:

python3 -m venv venv
source venv/bin/activate  # On Windows: `venv\Scripts\activate`

Install Python dependencies:

pip install django djangorestframework django-cors-headers

Create Django project and app (if not already done):

django-admin startproject femtrack_ai_backend .
python manage.py startapp core

Update femtrack_ai_backend/settings.py:

Add 'rest_framework', 'corsheaders', 'rest_framework.authtoken', and 'core' to INSTALLED_APPS.

Configure REST_FRAMEWORK for TokenAuthentication.

Set CORS_ALLOWED_ORIGINS to ["http://localhost:3000"] (or CORS_ALLOW_ALL_ORIGINS = True for quick dev).

Set AUTH_USER_MODEL = 'core.User'.

Define models in core/models.py (as per previous steps: User, PatientProfile, DoctorProfile, ScreeningRecord).

Create core/serializers.py (as per previous steps: UserSerializer, PatientProfileSerializer, etc.).

Create core/views.py (as per previous steps: UserViewSet, PatientProfileViewSet, ScreeningRecordViewSet, DoctorProfileViewSet with custom actions for registration, risk reports, and doctor dashboard data).

Create core/urls.py and update femtrack_ai_backend/urls.py to include api/ endpoints (using DefaultRouter and obtain_auth_token).

Run database migrations:

python manage.py makemigrations core
python manage.py migrate

Create a superuser (for admin access):

python manage.py createsuperuser

Download the processed dataset:
Ensure you have the cervical_cancer_processed_data.csv file. If not, download it from the conversation or re-run the data processing steps. Place this file in your FemTrackAI_Backend directory.

Seed the database with sample data:

Create core/management/commands/seed_data.py (as per previous steps).

Run the seed command:

python manage.py seed_data cervical_cancer_processed_data.csv

This will create patient users (e.g., p0001@example.com with password testpassword123) and a default doctor (doctor@femtrack.com with password password123).

Start the Django development server:

python manage.py runserver

The backend API will be available at http://localhost:8000/api/.

3. Frontend Setup (React)
Navigate to your desired directory and create the React app:

# Go up one level from your backend directory, or to your preferred development folder
# cd ..
npx create-react-app femtrack-frontend
cd femtrack-frontend

Install npm dependencies:

npm install react-router-dom axios

Create directory structure:

mkdir src/components src/pages src/services src/context

Create src/services/api.js to configure Axios and token interceptor.

Create src/context/AuthContext.js for authentication state management.

Create src/pages/Auth.js for the login and registration forms.

Create src/pages/PatientDashboard.js for the patient user interface.

Create src/pages/DoctorDashboard.js for the doctor user interface.

Update src/App.js to set up React Router and integrate AuthContext and PrivateRoute components.

Start the React development server:

npm start

The frontend application will be available at http://localhost:3000.

How to Use
Ensure both the Django backend and React frontend development servers are running.

Open your browser and navigate to http://localhost:3000.

You will be redirected to the Login/Register page.

To test as a patient:

Click "Register here" and create a new patient account, or

Login with a seeded patient: e.g., Email: p0001@example.com, Password: testpassword123.

You will be redirected to the Patient Dashboard.

To test as a doctor:

Click "Register here" and create a new doctor account, or

Login with the default doctor: Email: doctor@femtrack.com, Password: password123.

You will be redirected to the Doctor Dashboard.

Future Enhancements
Machine Learning Model Deployment: Replace the current rule-based risk assessment with a trained predictive model (e.g., using scikit-learn or TensorFlow) integrated directly into the Django backend.

Appointment Scheduling: Implement full functionality for patients to schedule appointments and for doctors to manage them.

Inventory Management System: Develop comprehensive features for tracking and managing medical supplies and screening tools.

Financial Transparency Module: Fully integrate real-time cost estimates and links to financing options.

Advanced Reporting: Generate detailed analytical reports for doctors and administrators.

Notifications and Reminders: Implement email/SMS notifications for appointments, follow-ups, and new recommendations.

User Interface Refinements: Enhance the UI/UX using a robust CSS framework (like Tailwind CSS, Material UI) or custom, detailed CSS/SCSS to match professional design mockups pixel-perfectly.

Robust Error Handling & Validation: Improve frontend and backend error handling, form validation, and user feedback mechanisms.

Scalability & Deployment: Prepare for production deployment on cloud platforms (e.g., AWS, Google Cloud, Heroku) with robust database solutions (PostgreSQL).

Contributing
This project is a prototype developed during a hackathon. Contributions and suggestions for improvement are welcome!

