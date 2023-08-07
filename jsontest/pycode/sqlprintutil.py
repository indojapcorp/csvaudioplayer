import pymysql
import sys

# Database connection details
host = "127.0.0.1"
port = 9889
user = "root"
password = "root"
database = "LangAppDataLatestMini"

def get_column_names(table_name):
    try:
        # Connect to the database
        connection = pymysql.connect(host=host, port=port, user=user, password=password, database=database)

        # Create a cursor object to execute SQL queries
        cursor = connection.cursor()

        # Get column names of the table "zh_pinyin"
        table_name = "zh_pinyin"
        query = f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '{database}' AND TABLE_NAME = '{table_name}'"
        cursor.execute(query)

        # Fetch all column names
        columns = cursor.fetchall()

        # Print the column names
        print("Column Names of 'zh_pinyin' table:")
        query = """
        SELECT CONCAT('{"data":[', GROUP_CONCAT(
            CONCAT('{',
        """

        for column in columns: 
            column_name = column[0]
            formatted_column_name = f'\'"{column_name}":"\', REPLACE(REPLACE(IFNULL(`{column_name}`, \'-\'), \'"\', \'\\\\"\'),\'\\n\',\'###\'), \'",\','
            query += formatted_column_name

        # Remove the trailing comma from the string
        query = query[:-1]

        query += """
        ,'}')
            ), ']}') AS json_data
        FROM zh_pinyin    
        """

        # Print the column names
        print("Column Names of 'zh_pinyin' table:", query)

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
    # Get the table name from the command-line argument or set the default table name as 'zh_pinyin'
    if len(sys.argv) > 1:
        table_name_arg = sys.argv[1]
    else:
        table_name_arg = 'zh_pinyin'

    # Call the function with the provided or default table name
    get_column_names(table_name_arg)



'''
SELECT
  english , category,
  MAX(CASE WHEN lang = 'FR' THEN langreading END) AS FR ,
  MAX(CASE WHEN lang = 'DE' THEN langreading END) AS DE,
  MAX(CASE WHEN lang = 'IT' THEN langreading END) AS IT,
  MAX(CASE WHEN lang = 'ES' THEN langreading END) AS ES, 
  MAX(CASE WHEN lang = 'JA' THEN langreading END) AS JA,
  MAX(CASE WHEN lang = 'JA' THEN roman END) AS JA_langreading,  
  MAX(CASE WHEN lang = 'ZH' THEN langreading END) AS ZH,
  MAX(CASE WHEN lang = 'ZH' THEN roman END) AS ZH_langreading,  
  MAX(CASE WHEN lang = 'KO' THEN langreading END) AS KO,  
  MAX(CASE WHEN lang = 'KO' THEN roman END) AS KO_langreading,
   MAX(CASE WHEN lang = 'RU' THEN langreading END) AS RU,  
  MAX(CASE WHEN lang = 'RU' THEN roman END) AS RU_langreading 
  FROM Phrases
where lang <> 'EN'
GROUP BY english, category 
order by id,category
'''