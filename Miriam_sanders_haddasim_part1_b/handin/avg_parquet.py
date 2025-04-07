import pandas as pd
import time
import  os
# for one file :
# advantages:
# read much faster the csv file - also saves the type of the original variable
# meaning no need to check if the field is a valid number or date
# because it is already saved
#(I converted the given csv to a parquet file and changed the type to the original data types-from the string - so it would be like an original parquet file)
# because of the quick processing of a parquet file there is no need to device it to multiple files , also no need to do validation.
#therefore from all the code I needed for reading a csv file I only need this to properly read the parquet file
def calculate_average_time_one_file(parquet_file_name):
    # read csv file
    df = pd.read_parquet(parquet_file_name)
    # remove duplicate rows based on the timestamp column
    # df = df.drop_duplicates(subset=[df.columns[0]])
    # remove whole duplicate rows...
    df = df.drop_duplicates()
    df["HourTime"] = convert_to_hour(df.iloc[:, 0])
    avg_time = df.groupby("HourTime")[df.columns[1]].mean()
    return avg_time.to_dict()
def convert_to_hour(date_series):
    return date_series.dt.floor("h").dt.strftime("%d/%m/%Y %H:00")
#part 1
print(calculate_average_time_one_file("time_series.parquet"))
