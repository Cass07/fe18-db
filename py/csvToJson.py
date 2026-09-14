import json
import csv
import os

def csv_to_json(_csv_file_path, _json_file_path):
    data = []
    with open(_csv_file_path, encoding='utf-8') as _csv_file:
        csv_reader = csv.DictReader(_csv_file)
        for row in csv_reader:
            data.append(row)

    for row in data:
        for key in row:
            # Trim whitespace from string values
            if isinstance(row[key], str):
                row[key] = row[key].strip()
            # Try to convert to int
            try:
                row[key] = int(row[key])
            except ValueError:
                pass

    with open(_json_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    csv_folder = "csv/"
    json_folder = "data/"
    # Convert all CSV files in the csv_folder to JSON files in the json_folder
    for csv_file in os.listdir(csv_folder):
        if csv_file.endswith(".csv"):
            csv_file_path = os.path.join(csv_folder, csv_file)
            json_file_name = os.path.splitext(csv_file)[0] + ".json"
            json_file_path = os.path.join(json_folder, json_file_name)
            csv_to_json(csv_file_path, json_file_path)
            print(f"Converted {csv_file} to {json_file_name}")
