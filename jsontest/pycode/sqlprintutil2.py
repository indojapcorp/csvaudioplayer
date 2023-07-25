import pymysql
import sys
import argparse

# Database connection details
host = "127.0.0.1"
port = 9889
user = "root"
password = "root"
database = "LangAppDataLatestMini"

def get_column_names(table_name , where , orderby):
    try:
        # Connect to the database
        connection = pymysql.connect(host=host, port=port, user=user, password=password, database=database)

        # Create a cursor object to execute SQL queries
        cursor = connection.cursor()

        # Get column names of the table
        query = f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '{database}' AND TABLE_NAME = '{table_name}'"
        cursor.execute(query)

        # Fetch all column names
        columns = cursor.fetchall()

        # Print the column names
        print(f"Column Names of '{table_name}' table:")

        query = """
        SELECT CONCAT('{"data":[', GROUP_CONCAT(
            CONCAT('{',
        """

        # Append column names to the variable in the specified format
        for idx, column in enumerate(columns):
            column_name = column[0]
            if idx == len(columns) - 1:
                formatted_column_name = f'\'"{column_name}":"\', REPLACE(REPLACE(IFNULL(`{column_name}`, \'-\'), \'"\', \'\\\\"\'),\'\\n\',\'###\'), \'"\''
            else:
                formatted_column_name = f'\'"{column_name}":"\', REPLACE(REPLACE(IFNULL(`{column_name}`, \'-\'), \'"\', \'\\\\"\'),\'\\n\',\'###\'), \'",\','

            query += formatted_column_name

        query += """
        ,'}')
            ), ']}') AS json_data
        """
        
        query += ' FROM ' + table_name
        if(where):
            query += " " + where

        if(orderby):
            query += " " + orderby

        # Print the query
        print("Generated Query:", query)

        cursor.execute('SET SESSION group_concat_max_len = 99999999999999999');

        # Execute the query
        cursor.execute(query)

        # Fetch the JSON output
        json_output = cursor.fetchone()[0]

        # Print the column names
        print(f"Column Names of '{table_name}' table:", json_output)

        # Write JSON output to file
        with open(f"{table_name}_output.json", "w") as file:
            file.write(json_output)

    except pymysql.Error as e:
        print("Error:", e)

    finally:
        # Close the cursor and connection
        if cursor:
            cursor.close()
        if connection:
            connection.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch column names of a table and write the output to JSON.")
    parser.add_argument("-t", "--table", type=str, help="Table name", default="zh_pinyin")
    parser.add_argument("-w", "--where", type=str, help="Where clause", default="")
    parser.add_argument("-o", "--orderBy", type=str, help="Column to order by", default="")
    args = parser.parse_args()

    # Call the function with the provided or default table name and orderBy column
    get_column_names(args.table, args.where, args.orderBy)
