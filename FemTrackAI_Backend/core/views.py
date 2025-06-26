from django.shortcuts import render
# core/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count

from .models import User, PatientProfile, DoctorProfile, ScreeningRecord
from .serializers import (
    UserSerializer,
    PatientProfileSerializer,
    DoctorProfileSerializer,
    ScreeningRecordSerializer,
    PatientRiskReportSerializer,
    DoctorPatientListSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # Allow anyone to create an account for signup

    def get_permissions(self):
        # Allow anyone to register (create new users)
        if self.action == 'create':
            return [AllowAny()]
        # For other actions (retrieve, update, delete), require authentication
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='register-patient', permission_classes=[AllowAny])
    def register_patient(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(user_type='patient')
        PatientProfile.objects.create(user=user) # Create a related PatientProfile
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='register-doctor', permission_classes=[AllowAny])
    def register_doctor(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(user_type='doctor')
        DoctorProfile.objects.create(user=user) # Create a related DoctorProfile
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='me', permission_classes=[IsAuthenticated])
    def get_current_user_profile(self, request):
        """
        Get the profile details of the currently logged-in user.
        """
        user = request.user
        if user.user_type == 'patient':
            try:
                profile = PatientProfile.objects.get(user=user)
                serializer = PatientProfileSerializer(profile)
            except PatientProfile.DoesNotExist:
                return Response({'detail': 'Patient profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        elif user.user_type == 'doctor':
            try:
                profile = DoctorProfile.objects.get(user=user)
                serializer = DoctorProfileSerializer(profile)
            except DoctorProfile.DoesNotExist:
                return Response({'detail': 'Doctor profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # For admin or other user types without specific profiles
            serializer = UserSerializer(user)
        return Response(serializer.data)


class PatientProfileViewSet(viewsets.ModelViewSet):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated] # Only authenticated users can access profiles

    def get_queryset(self):
        # A patient can only see their own profile
        if self.request.user.user_type == 'patient':
            return PatientProfile.objects.filter(user=self.request.user)
        # Doctors can see all patient profiles (for now, refine later for specific doctor's patients)
        elif self.request.user.user_type == 'doctor':
            return PatientProfile.objects.all()
        return PatientProfile.objects.none() # Admins can access all via default queryset

    # Custom action for a patient to get their own risk report (as per frontend design)
    @action(detail=True, methods=['get'], url_path='risk-report', permission_classes=[IsAuthenticated])
    def risk_report(self, request, pk=None):
        """
        Retrieves the personalized risk report for a specific patient.
        If the requesting user is a patient, they can only see their own report.
        If the requesting user is a doctor, they can see any patient's report.
        """
        try:
            patient_profile = self.get_queryset().get(pk=pk)
        except PatientProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Ensure a patient can only access their own risk report
        if request.user.user_type == 'patient' and patient_profile.user != request.user:
            return Response({"detail": "You do not have permission to access this patient's risk report."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = PatientRiskReportSerializer(patient_profile)
        return Response(serializer.data)

    # Action for doctors to list patients with simplified info (for doctor's dashboard table)
    @action(detail=False, methods=['get'], url_path='for-doctor-dashboard', permission_classes=[IsAuthenticated])
    def for_doctor_dashboard(self, request):
        if request.user.user_type != 'doctor':
            return Response({"detail": "Only doctors can access this resource."}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset() # This will already filter for doctors to see all
        serializer = DoctorPatientListSerializer(queryset, many=True)
        # You can add aggregation logic here for Total Patients, High Risk etc. counts
        # For now, frontend can count from this list.
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='summary-counts', permission_classes=[IsAuthenticated])
    def summary_counts(self, request):
        if request.user.user_type != 'doctor':
            return Response({"detail": "Only doctors can access this resource."}, status=status.HTTP_403_FORBIDDEN)

        total_patients = PatientProfile.objects.count()
        risk_counts = PatientProfile.objects.values('risk_level').annotate(count=Count('risk_level'))

        risk_dict = {item['risk_level']: item['count'] for item in risk_counts}

        response_data = {
            'total_patients': total_patients,
            'high_risk': risk_dict.get('High Risk', 0),
            'moderate_risk': risk_dict.get('Moderate Risk', 0),
            'low_risk': risk_dict.get('Low Risk', 0),
            'pending_assessment': risk_dict.get('Unknown', 0) # Assuming 'Unknown' means pending or needs review
        }
        return Response(response_data)


class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated] # Only authenticated doctors can manage their profiles

    def get_queryset(self):
        # A doctor can only see or update their own profile
        if self.request.user.user_type == 'doctor':
            return DoctorProfile.objects.filter(user=self.request.user)
        return DoctorProfile.objects.none() # No one else can list all doctors via this endpoint


class ScreeningRecordViewSet(viewsets.ModelViewSet):
    queryset = ScreeningRecord.objects.all()
    serializer_class = ScreeningRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Patients can only see their own screening records
        if self.request.user.user_type == 'patient':
            return ScreeningRecord.objects.filter(patient__user=self.request.user)
        # Doctors can see all screening records (for now, refine if specific doctor's patients)
        elif self.request.user.user_type == 'doctor':
            return ScreeningRecord.objects.all()
        return ScreeningRecord.objects.none() # Admins can access all via default queryset

    def perform_create(self, serializer):
        # When creating a screening record, associate it with the correct patient and doctor
        # If doctor is making the assessment, link it to them
        doctor_profile = None
        if self.request.user.user_type == 'doctor':
            try:
                doctor_profile = DoctorProfile.objects.get(user=self.request.user)
            except DoctorProfile.DoesNotExist:
                pass # Should not happen if doctor user_type exists

        # For a new assessment, the patient's risk level should be updated based on this new screening
        # You'll need to pass the patient_id in the request data
        patient_id = self.request.data.get('patient')
        try:
            patient_profile = PatientProfile.objects.get(pk=patient_id)
        except PatientProfile.DoesNotExist:
            return Response({'detail': 'Patient not found for this screening.'}, status=status.HTTP_400_BAD_REQUEST)

        # Save the screening record
        screening = serializer.save(doctor=doctor_profile, patient=patient_profile)

        # Recalculate and update the patient's overall risk level based on the new screening
        # This is where your rule-based logic from data preprocessing comes in.
        # For simplicity, we'll assume the 'assessment_risk_level' from the new screening
        # dictates the patient's overall risk for now. In a real scenario, you'd
        # analyze all past screenings for a comprehensive risk.

        patient_profile.risk_level = screening.assessment_risk_level
        patient_profile.save()

    # Action for a doctor to create a new assessment for a patient
    @action(detail=False, methods=['post'], url_path='new-assessment', permission_classes=[IsAuthenticated])
    def new_assessment(self, request):
        if request.user.user_type != 'doctor':
            return Response({"detail": "Only doctors can create new assessments."}, status=status.HTTP_403_FORBIDDEN)

        # This will use perform_create automatically to save and update patient risk
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)