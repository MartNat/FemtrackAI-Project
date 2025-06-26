import pandas as pd
import numpy as np

def clean_cervical_cancer_data_simplified(input_csv_path, output_csv_path):
    """
    Cleans and processes the partially pre-processed cervical cancer dataset,
    specifically to add 'Risk Level' and ensure correct formatting for Django seeding.

    Args:
        input_csv_path (str): Path to the current input CSV file.
        output_csv_path (str): Path where the cleaned CSV file will be saved.
    """
    try:
        # 1. Load the dataset
        df = pd.read_csv(input_csv_path)
        print(f"Original data shape: {df.shape}")
        print("Original columns:", df.columns.tolist())

        # 2. Drop the 'Unnamed: 12' column if it exists
        if 'Unnamed: 12' in df.columns:
            df = df.drop(columns=['Unnamed: 12'])
            print("Dropped 'Unnamed: 12' column.")

        # 3. Ensure numeric types for relevant columns
        numeric_cols = ['Age', 'Sexual Partners', 'First Sexual Activity Age']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                df[col].fillna(df[col].median(), inplace=True) # Impute missing numeric with median

        # Ensure Smoking Status and STDs History are 'Y'/'N'
        binary_map = {1: 'Y', 0: 'N', 'Y': 'Y', 'N': 'N'} # Handle both 0/1 and 'Y'/'N'
        if 'Smoking Status' in df.columns:
            df['Smoking Status'] = df['Smoking Status'].astype(str).str.upper().map(binary_map).fillna('N')
        if 'STDs History' in df.columns:
            df['STDs History'] = df['STDs History'].astype(str).str.upper().map(binary_map).fillna('N')
        if 'Insrance Covered' in df.columns: # Correct for possible initial 'N' or 0/1
            df['Insrance Covered'] = df['Insrance Covered'].astype(str).str.upper().map({'Y': 'Y', 'N': 'N', '1': 'Y', '0': 'N'}).fillna('N')


        # 4. Calculate 'Risk Level' based on existing columns
        # This logic is for demonstration. For a real AI system, this would be a model prediction.
        def assign_risk_level_from_current_data(row):
            risk = 'Low Risk'
            if row['Age'] > 50 or row['Smoking Status'] == 'Y' or row['STDs History'] == 'Y':
                risk = 'Moderate Risk'
            # Assuming 'HPV Test Result' is 'POSITIVE'/'NEGATIVE' and 'Pap Smear Result' is 'Y'/'N'
            if row['HPV Test Result'] == 'POSITIVE' or row['Pap Smear Result'] == 'Y':
                risk = 'High Risk'
            return risk

        df['Risk Level'] = df.apply(assign_risk_level_from_current_data, axis=1)

        # 5. Ensure Patient ID is sequential and unique for seeding
        df['Patient ID'] = [f'P{i+1:04d}' for i in range(len(df))]


        # Select only the columns relevant for your Django models
        # Ensure column names match what your seed_data.py expects
        final_columns = [
            'Patient ID', 'Age', 'Sexual Partners', 'First Sexual Activity Age',
            'Risk Level', 'HPV Test Result', 'Pap Smear Result', 'Smoking Status',
            'STDs History', 'Region', 'Insrance Covered', 'Recommended Action',
            'Screening Type Last'
        ]

        # Ensure all final_columns exist in the DataFrame before selecting
        missing_cols = [col for col in final_columns if col not in df.columns]
        if missing_cols:
            print(f"Warning: The following expected columns are missing in your input CSV and cannot be included: {missing_cols}")
            # If these are critical for your Django model, you might need to reconsider your input CSV.

        df_cleaned = df[final_columns]
        print(f"Cleaned data shape: {df_cleaned.shape}")
        print("Cleaned columns:", df_cleaned.columns.tolist())

        # 6. Save the cleaned dataset
        df_cleaned.to_csv(output_csv_path, index=False, encoding='utf-8')
        print(f"Cleaned data saved to {output_csv_path}")

    except FileNotFoundError:
        print(f"Error: Input file not found at {input_csv_path}")
    except KeyError as e:
        print(f"An error occurred during cleaning: Column '{e}' not found. "
              "Please check your input CSV file's column names against the script's expectations.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    # IMPORTANT: Keep this as the actual path to your original CSV file
    input_file = r'C:\Users\Martina\Desktop\Femtrack2\Cervical Cancer Datasets_.xlsx - Cervical Cancer Risk Factors.csv'
    # IMPORTANT: Define the output path for the cleaned CSV (should be in your Django backend root)
    output_file = r'C:\Users\Martina\Desktop\Femtrack2\FemTrackAI_Backend\cervical_cancer_processed_data.csv'

    # Make sure the output directory exists
    import os
    output_dir = os.path.dirname(output_file)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    clean_cervical_cancer_data_simplified(input_file, output_file)