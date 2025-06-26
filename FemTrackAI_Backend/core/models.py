# core/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

# Extend Django's default User model to add 'user_type'
class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
    )
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='patient'
    )
    email = models.EmailField(unique=True) # Ensure email is unique for login
    # Add any other common fields if needed

    USERNAME_FIELD = 'email'  # Use email as the primary login field
    REQUIRED_FIELDS = ['username', 'user_type'] # Add user_type to required fields during superuser creation


    def __str__(self):
        return self.email

# Set the custom User model as the AUTH_USER_MODEL in settings.py
# (We will add this to settings.py in the next step)


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='patient_profile')
    age = models.IntegerField()
    sexual_partners = models.IntegerField()
    first_sexual_activity_age = models.IntegerField()
    # Risk Level will be dynamically calculated or set based on the latest assessment
    # For initial seeding, we'll use the 'Risk Level' from the CSV
    risk_level = models.CharField(max_length=20, default='Unknown')

    def __str__(self):
        return f"Profile for {self.user.email}"

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='doctor_profile')
    # Add any specific doctor fields here, e.g., specialization, license_number
    specialization = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"

class ScreeningRecord(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='screenings')
    screening_date = models.DateField(auto_now_add=True) # Automatically set on creation
    screening_type = models.CharField(max_length=50) # e.g., 'PAP SMEAR', 'HPV DNA', 'VIA'
    hpv_test_result = models.CharField(max_length=20, blank=True, null=True) # 'POSITIVE', 'NEGATIVE'
    pap_smear_result = models.CharField(max_length=20, blank=True, null=True) # 'Y', 'N'
    smoking_status = models.CharField(max_length=5, blank=True, null=True) # 'Y', 'N'
    stds_history = models.CharField(max_length=5, blank=True, null=True) # 'Y', 'N'
    region = models.CharField(max_length=100, blank=True, null=True)
    insurance_covered = models.CharField(max_length=5, blank=True, null=True) # 'Y', 'N'
    recommended_action = models.TextField(blank=True, null=True) # Standardized action
    # This result could be derived from the screening results and other factors
    # It reflects the risk associated with this specific screening
    assessment_risk_level = models.CharField(max_length=20, default='Unknown')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assessments_made')


    class Meta:
        ordering = ['-screening_date'] # Order by most recent screening first

    def __str__(self):
        return f"Screening for {self.patient.user.email} on {self.screening_date}"

# Future Models (for later steps in the hackathon):
# class Appointment(models.Model):
#     patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)
#     doctor = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, blank=True)
#     appointment_date = models.DateTimeField()
#     status = models.CharField(max_length=20, default='Scheduled')
#     # Add location, type of appointment etc.

# class Inventory(models.Model):
#     item_name = models.CharField(max_length=100)
#     quantity_available = models.IntegerField()
#     last_updated = models.DateTimeField(auto_now=True)

# class CostEstimate(models.Model):
#     service_type = models.CharField(max_length=100)
#     cost = models.DecimalField(max_digits=10, decimal_places=2)
#     notes = models.TextField(blank=True, null=True)