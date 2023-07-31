import sqlite3
import os

# Replace 'your_database.db' with the path to your SQLite database file
db_path = 'dictionary_ja.db'

# Function to estimate the size of a table in megabytes
def estimate_table_size(conn, table_name):
    cursor = conn.cursor()
    cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';")
    create_statement = cursor.fetchone()[0]

    # Extract column definitions from the create statement
    column_defs = create_statement.split("(")[1].split(")")[0].split(",")
    # Estimate the size based on the number of columns and their average length
    estimated_row_size = sum(len(column) for column in column_defs) / len(column_defs)
    # Get the row count
    cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
    row_count = cursor.fetchone()[0]

    # Calculate the size in bytes
    size_bytes = row_count * estimated_row_size

    # Calculate the size in megabytes
    size_mb = size_bytes / (1024 * 1024)

    return row_count, size_mb

# Connect to the database
conn = sqlite3.connect(db_path)

# Get the list of table names from the database
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
table_names = cursor.fetchall()

total_size=0
# Loop through each table, estimate the record count and size, and print the results
for table in table_names:
    table_name = table[0]
    row_count, size_mb = estimate_table_size(conn, table_name)
    tablesize=row_count*size_mb
    total_size+=10*size_mb
    print(f"Table: {table_name}, Record Count: {row_count}, Size (MB): {10*size_mb:.4f}")

print(f'total size= {total_size}')
# Close the connection
cursor.close()
conn.close()
