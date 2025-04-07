import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
# Read the CSV file
csv_file_path = "time_series.csv"
df = pd.read_csv(csv_file_path)
print(df.columns)
# Convert the timestamp column to datetime (assuming the column is named 'timestamp')
df['timestamp'] = pd.to_datetime(df['timestamp'], dayfirst=True)
# # Convert the value column to numeric (assuming the column is named 'value')
df['value'] = pd.to_numeric(df['value'], errors='coerce')  # 'coerce' will turn errors into NaNs
 # Save to Parquet
parquet_file_path = "time_series.parquet"
df.to_parquet(parquet_file_path, engine='pyarrow', index=False)
print(f"CSV file converted and saved as {parquet_file_path}")
