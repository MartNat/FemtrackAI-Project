# core/serializers.py
from rest_framework import serializers
from .models import User, PatientProfile, DoctorProfile, ScreeningRecord

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': False}} # Password is write-only for security

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        # Update user fields
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance


class PatientProfileSerializer(serializers.ModelSerializer):
    # Include user details nested within the patient profile
    user = UserSerializer(read_only=True) # read_only=True ensures user isn't created/updated via profile serializer

    class Meta:
        model = PatientProfile
        fields = '__all__' # Includes 'user', 'age', 'sexual_partners', 'first_sexual_activity_age', 'risk_level'

class DoctorProfileSerializer(serializers.ModelSerializer):
    # Include user details nested within the doctor profile
    user = UserSerializer(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = '__all__' # Includes 'user', 'specialization'

class ScreeningRecordSerializer(serializers.ModelSerializer):
    # Optionally, display patient's user email instead of just patient ID
    patient_email = serializers.CharField(source='patient.user.email', read_only=True)
    doctor_email = serializers.CharField(source='doctor.user.email', read_only=True)

    class Meta:
        model = ScreeningRecord
        # Ensure all fields are included for complete data representation
        fields = [
            'id', 'patient', 'patient_email', 'doctor', 'doctor_email', 'screening_date',
            'screening_type', 'hpv_test_result', 'pap_smear_result',
            'smoking_status', 'stds_history', 'region', 'insurance_covered',
            'recommended_action', 'assessment_risk_level'
        ]
        read_only_fields = ['screening_date', 'patient_email', 'doctor_email', 'assessment_risk_level'] # Date is auto_now_add, risk level will be set by backend logic


# Serializer for patient-specific view (e.g., for 'My Risk Report')
class PatientRiskReportSerializer(serializers.ModelSerializer):
    last_screening_date = serializers.SerializerMethodField()
    risk_level = serializers.CharField(source='risk_level', read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user', 'risk_level', 'last_screening_date']

    def get_last_screening_date(self, obj):
        last_screening = obj.screenings.first() # Assumes ordering is by descending date
        return last_screening.screening_date if last_screening else None

# Serializer for simplified patient list for doctor's dashboard
class DoctorPatientListSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='user.username', read_only=True) # Using username as patient ID
    name = serializers.SerializerMethodField() # For doctor's dashboard 'Name' column
    email = serializers.CharField(source='user.email', read_only=True)
    last_assessment_date = serializers.SerializerMethodField() # For doctor's dashboard 'Last Assessment'

    class Meta:
        model = PatientProfile
        fields = ['user', 'patient_id', 'name', 'email', 'risk_level', 'last_assessment_date']

    def get_name(self, obj):
        # Prefer first_name last_name, fallback to email/username if not set
        if obj.user.first_name and obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.user.username if obj.user.username else obj.user.email

    def get_last_assessment_date(self, obj):
        last_screening = obj.screenings.first()
        return last_screening.screening_date if last_screening else None