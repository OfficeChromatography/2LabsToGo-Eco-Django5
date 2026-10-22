#sql for python
#This file must be in the folder 2LabsToGo-Eco-Software/app

#import os
import os
#import glob
import glob
# import the sqlite3 module
import sqlite3

def updateSpeed():
    try:
        sqliteConnection = sqlite3.connect('db.sqlite3')
        cursor = sqliteConnection.cursor()
        print("Connected to SQLite")

        sql_update_query = """Update sampleapp_movementsettings_db set motor_speed = motor_speed/60 where motor_speed > 100"""
        cursor.execute(sql_update_query)
        sqliteConnection.commit()
        print("Record Updated successfully ")
        cursor.close()

    except sqlite3.Error as error:
        print("Failed to update sqlite table", error)
    finally:
        if sqliteConnection:
            sqliteConnection.close()
            print("The SQLite connection is closed")

# Create a connection object
connection = sqlite3.connect("db.sqlite3")

# Get a cursor
cursor = connection.cursor()

# Add columns
addColumn1 = "ALTER TABLE sampleapp_pressuresettings_db ADD COLUMN rinsingFactor float"
addColumn2 = "ALTER TABLE sampleapp_bandscomponents_db ADD COLUMN sample_factor float"
addColumn3 = "ALTER TABLE finecontrol_method_db ADD COLUMN created_at datetime"
addColumn4 = "ALTER TABLE finecontrol_method_db ADD COLUMN updated_at datetime"
addColumn5 = "ALTER TABLE sampleapp_pressuresettings_db ADD COLUMN vialtype float"

cursor.execute(addColumn1)
cursor.execute(addColumn2)
cursor.execute(addColumn3)
cursor.execute(addColumn4)
cursor.execute(addColumn5)

# close the database connection
connection.close()

updateSpeed()
