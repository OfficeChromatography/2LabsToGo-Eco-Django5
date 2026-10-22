#sql for python
#This file must be in the folder 2LabsToGo-Eco-Software/app

#import os
import os
#import glob
import glob
# import the sqlite3 module
import sqlite3

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
addColumn6 = "UPDATE sampleapp_movementsettings_db SET motor_speed = motor_speed/60 WHERE motor_speed > 100"

cursor.execute(addColumn1)
cursor.execute(addColumn2)
cursor.execute(addColumn3)
cursor.execute(addColumn4)
cursor.execute(addColumn5)
cursor.execute(addColumn6)

# close the database connection
connection.close()

#delete 0001_initial.py in migrations of sampleapp, finecontrol, development, detection
if os.path.exists("./sampleapp/migrations/0001_initial.py"):
  os.remove("./sampleapp/migrations/0001_initial.py")
else:
  print("The file does not exist")
  
if os.path.exists("./finecontrol/migrations/0001_initial.py"):
  os.remove("./finecontrol/migrations/0001_initial.py")
else:
  print("The file does not exist")

if os.path.exists("./development/migrations/0001_initial.py"):
  os.remove("./development/migrations/0001_initial.py")
else:
  print("The file does not exist")
  
if os.path.exists("./detection/migrations/0001_initial.py"):
  os.remove("./detection/migrations/0001_initial.py")
else:
  print("The file does not exist")

#delete all pyc files
files = glob.glob('./**/*.pyc', recursive=True)

for f in files:
    try:
        os.remove(f)
    except OSError as e:
        print("Error: %s : %s" % (f, e.strerror))
