import pandas as pd
import time
import  os
# check if the date is correct
def check_date_format(date_series):
    try:
        return pd.to_datetime(date_series, format="%d/%m/%Y %H:%M", errors="coerce").notna()
    except Exception:
        return False

# check if value is  a number
def check_value(value_series):
    pattern = r"^-?\d+(\.\d+)?$"
    return value_series.astype(str).str.match(pattern)
# for one file :
def calculate_average_time_one_file(csv_file_name):
    # read csv file
    df = pd.read_csv(csv_file_name, parse_dates=[0], dayfirst=True)
    # Convert to string first to handle any non-string values
    df.iloc[:, 1] = pd.to_numeric(df.iloc[:, 1].astype(str), errors='coerce')
    # validate rows - only keep rows where value column is not NaN
    valid_rows = df.iloc[:, 1].notna() & check_date_format(df.iloc[:, 0])
    df = df[valid_rows]
    # remove duplicate rows based on timestamp
    df = df.drop_duplicates(subset=[df.columns[0]])
    # remove minutes and create hourly grouping
    df["HourTime"] = convert_to_hour(df.iloc[:, 0])
    # group by each hour then calculate the mean
    avg_time = df.groupby("HourTime")[df.columns[1]].mean()
    # return a dictionary with the hours and averages
    return avg_time.to_dict()

# split the csv file into separate files based on date
def split_csv_file():
    # make sure there is a folder called segmented_time_series
    if not os.path.exists("segmented_time_series"):
        os.makedirs("segmented_time_series")
    #read csv
    df = pd.read_csv("time_series.csv", parse_dates=[0], dayfirst=True)
    # filter only rows that pass the validation
    valid_rows = check_value(df.iloc[:, 1]) & check_date_format(df.iloc[:, 0])
    df = df[valid_rows]
    # remove duplicate rows based on the timestamp column
    # df = df.drop_duplicates(subset=[df.columns[0]])
    # remove whole duplicate rows...
    df = df.drop_duplicates()
    # add a column that has the date without the time
    df["DateOnly"] = df.iloc[:, 0].dt.date
    unique_dates = df["DateOnly"].unique()
    # count the amount of unique dates
    date_indices = {date: i + 1 for i, date in enumerate(unique_dates)}
    filenames = {date: f"segmented_time_series/segmented_time_series_{date_indices[date]}.csv"
                 for date in unique_dates}
    # create a mask for every unique date write to the appropriate csv file
    for date in unique_dates:
        mask = df["DateOnly"] == date
        df.loc[mask, df.columns[:-1]].to_csv(filenames[date], index=False)
# return the amount of csv files
    return len(unique_dates)

# remove the seconds and minutes from the time stamp
def convert_to_hour(date_series):
    return date_series.dt.floor("h").dt.strftime("%d/%m/%Y %H:00")
# for only one file -will return a dictionary and not write to a file ( א)
# calculate the mean for every hour
def calculate_average_time(csv_file_name):
    # read csv file
    df = pd.read_csv(csv_file_name, parse_dates=[0], dayfirst=False)
    # validate rows
    valid_rows = check_value(df.iloc[:, 1]) & check_date_format(df.iloc[:, 0])
    df = df[valid_rows]
    # remove minutes
    df["HourTime"] = convert_to_hour(df.iloc[:, 0])
    # group by each hour then calculate the mean - average of each hour
    avg_time = df.groupby("HourTime")[df.columns[1]].mean()
    # remove the timestamp column from each  row
    avg_time.drop(columns=["timestamp"], inplace=True)
    # return a dictionary with the hours and averages
    return avg_time.to_dict()

def calculate_segmented_avg_time():
    # count how long it takes
    start_time = time.time()
    index =split_csv_file()
    print(f"--- Split Time: {time.time() - start_time:.2f} seconds ---")
    # create a dictionary for all the averages
    total_avg_time = {}
    # for every file calculate the average times and merge the dictionary returned with the total_avg_time dictionary
    for i in range(1, index + 1):
        name = f"segmented_time_series/segmented_time_series_{i}.csv"
        total_avg_time.update(calculate_average_time(name))
    # convert the dictionary to a dataframe
    avg_df = pd.DataFrame(list(total_avg_time.items()), columns=["HourTime", "Average"])
    # write the final answer to a csv file
    avg_df.to_csv("segmented_time_series/average_times.csv", index=False)

    print(f"--- Total Processing Time: {time.time() - start_time:.2f} seconds ---")
#part 1
print(calculate_average_time_one_file("time_series.csv"))
# part 2
calculate_segmented_avg_time()
# part 3
# data received in a stream:
# 1. Initialize a dictionary with keys as time (hour of the timestamp) and values as tuples (sum, count, current_average).
# 2. On receiving new data (timestamp, value):
#    - Find the correct time window (hour).
#    - Update the sum and count for that time window.
# 3. Calculate the new average: current_average = sum / count.
# 4. Insert/update the dictionary entry with the new sum, count, and average.
# 5. Repeat the process for each new incoming data entry.
# periodically add/update to a csv file and empty the directory to save run time and space