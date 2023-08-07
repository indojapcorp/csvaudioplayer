import pymysql

def contains_katakana(text):
    # Function to check if a string contains Katakana characters
    # Replace this function with a more accurate Katakana check if needed
    katakana_range = set(range(0x30A0, 0x30FF + 1))
    return any(ord(char) in katakana_range for char in text)

def select_katakana_data():
    # Replace the following with your MySQL database credentials
    host = "127.0.0.1"
    port = 9889
    user = "root"
    password = "root"
    database = "LangAppForSQLite"    
    charset = 'utf8mb4'  # Use 'utf8mb4' if your database supports it

    try:
        # Connect to the MySQL database
        connection = pymysql.connect(host=host, port=port, user=user, password=password, database=database,charset=charset)

        # Create a cursor object to execute SQL queries
        cursor = connection.cursor()

        # Query to select col_name from your_table_name
        query = "SELECT _id,word FROM jisho_japanese_classifications_entries_copy"

        # Execute the query
        cursor.execute(query)

        # Fetch all rows from the result set
        results = cursor.fetchall()

        id_in = ""
        # Process and check each row for Katakana characters
        for row in results:
            col_name = row[1]
            col_id = row[0]
            if contains_katakana(col_name):
                id_in+=str(col_id) + ","

        print(id_in)

        # Close the cursor and connection
        cursor.close()
        connection.close()

    except pymysql.Error as e:
        print("Error: ", e)

if __name__ == "__main__":
    select_katakana_data()
