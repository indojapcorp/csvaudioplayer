import json

def convert_text_file_to_json(filename):
    json_data = []
    with open(filename, 'r') as file:
        text = file.read().strip()
        blocks = text.split('\n\n')
        for i, block in enumerate(blocks):
            block = block.strip()
            if block:
                json_block = {
                    'id': i,
                    'text': block
                }
                json_data.append(json_block)

    json_output = {
        'data': json_data
    }
    return json_output

# Usage
filename = 'input.txt'
json_output = convert_text_file_to_json(filename)
json_string = json.dumps(json_output, indent=4)
print(json_string)
