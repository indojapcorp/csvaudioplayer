import sys
import json
import re

def convert_text_file_to_json(input_filename):
    json_data = []
    with open(input_filename, 'r') as file:
        text = file.read().strip()
        #blocks = text.split('\n\n')
        blocks = re.split('\n{2,}', text.strip())

        for i, block in enumerate(blocks):
            block = block.strip()
            if block:
                json_block = {
                    'id': i+1,
                    'text': block
                }
                json_data.append(json_block)

    json_output = {
        'data': json_data
    }
    return json_output

# Get input and output filenames from command line arguments
if len(sys.argv) > 2:
    input_filename = sys.argv[1]
    output_filename = sys.argv[2]
    json_output = convert_text_file_to_json(input_filename)

    # Write JSON output to file
    with open(output_filename, 'w') as output_file:
        json.dump(json_output, output_file, indent=4)
        print(f"JSON output written to {output_filename}")
else:
    print("Please provide both the input filename and output filename as command line arguments.")
