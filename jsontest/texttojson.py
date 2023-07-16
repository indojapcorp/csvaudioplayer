import json

def convert_text_file_to_json(filename):
    json_data = []
    with open(filename, 'r') as file:
        lines = file.readlines()
        i = 1
        for line in lines:
            line = line.strip()
            if line:
                json_line = {
                    'id': i,
                    'text': line
                }
                json_data.append(json_line)
                i += 1

    json_output = {
        'data': json_data
    }
    return json_output

# Usage
filename = 'input.txt'
json_output = convert_text_file_to_json(filename)
json_string = json.dumps(json_output, indent=4)
print(json_string)
