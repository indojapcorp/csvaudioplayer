input_filename = "input.txt"
output_filename = "gcpoutput.txt"

with open(input_filename, "r") as infile, open(output_filename, "w") as outfile:
    for line in infile:
        line = line.strip()
        if line and line[0].isdigit():
            outfile.write("####\n")
        outfile.write(line + "\n")