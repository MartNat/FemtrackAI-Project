# core/management/commands/seed_data.py
import csv
from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import User, PatientProfile, ScreeningRecord, DoctorProfile # Ensure DoctorProfile is imported

class Command(BaseCommand):
    help = 'Seeds the database with patient and screening data from a CSV file.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the processed CSV file (e.g., cervical_cancer_processed_data.csv)')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        self.stdout.write(self.style.SUCCESS(f'Attempting to seed data from: {csv_file_path}'))

        try:
            with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                data = list(reader) # Read all rows into memory

                # Create a default doctor account for seeding (if not exists)
                # This doctor will be assigned to all seeded screenings for simplicity
                doctor_user, created = User.objects.get_or_create(
                    username='default_doctor',
                    email='doctor@femtrack.com',
                    user_type='doctor',
                    defaults={'first_name': 'Default', 'last_name': 'Doctor', 'is_staff': True}
                )
                if created:
                    doctor_user.set_password('password123') # Set a strong password in production
                    doctor_user.save()
                    DoctorProfile.objects.get_or_create(user=doctor_user)
                    self.stdout.write(self.style.SUCCESS('Created default doctor: doctor@femtrack.com (password: password123)'))
                else:
                    self.stdout.write(self.style.WARNING('Default doctor already exists. Skipping creation.'))

                default_doctor_profile = DoctorProfile.objects.get(user=doctor_user)


                with transaction.atomic():
                    for row in data:
                        patient_id = row['Patient ID']
                        email = f"{patient_id.lower()}@example.com" # Generate a unique email
                        username = patient_id.lower()

                        # Create or get User for Patient
                        user, created = User.objects.get_or_create(
                            username=username,
                            defaults={
                                'email': email,
                                'user_type': 'patient',
                                'password': 'testpassword123' # Set a default password
                            }
                        )
                        if created:
                            user.set_password('testpassword123') # Set password for new users
                            user.save()
                            self.stdout.write(self.style.SUCCESS(f'Created user: {username}'))

                        # Create or get PatientProfile
                        patient_profile, created = PatientProfile.objects.get_or_create(
                            user=user,
                            defaults={
                                'age': int(row['Age']),
                                'sexual_partners': int(row['Sexual Partners']),
                                'first_sexual_activity_age': int(row['First Sexual Activity Age']),
                                'risk_level': row['Risk Level'] # Use the pre-calculated risk level
                            }
                        )
                        if created:
                             self.stdout.write(self.style.SUCCESS(f'Created patient profile for {username}'))
                        else:
                            # Update existing profile with risk_level in case it changed
                            patient_profile.age = int(row['Age'])
                            patient_profile.sexual_partners = int(row['Sexual Partners'])
                            patient_profile.first_sexual_activity_age = int(row['First Sexual Activity Age'])
                            patient_profile.risk_level = row['Risk Level']
                            patient_profile.save()
                            self.stdout.write(self.style.WARNING(f'Updated patient profile for {username}'))


                        # Create ScreeningRecord
                        # Use a try-except for integer conversion for robustness
                        try:
                            # Adjust date formatting if needed, for simplicity use today's date if not specific
                            # For the hackathon, we can use a generic date or parse if a date column exists.
                            # Since the original CSV did not have a specific screening date, we'll use auto_now_add
                            # in the model. If you need specific dates from CSV, add a date column to your CSV.
                            ScreeningRecord.objects.create(
                                patient=patient_profile,
                                doctor=default_doctor_profile, # Assign to the default doctor
                                screening_type=row['Screening Type Last'],
                                hpv_test_result=row['HPV Test Result'],
                                pap_smear_result=row['Pap Smear Result'],
                                smoking_status=row['Smoking Status'],
                                stds_history=row['STDs History'],
                                region=row['Region'],
                                insurance_covered=row['Insrance Covered'], # Corrected typo in column name
                                recommended_action=row['Recommended Action'],
                                assessment_risk_level=row['Risk Level'] # Risk level for this specific assessment
                            )
                            self.stdout.write(self.style.SUCCESS(f'Created screening record for {patient_id}'))
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f'Error creating screening record for {patient_id}: {e}'))

                self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'Error: CSV file not found at {csv_file_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An unexpected error occurred: {e}'))