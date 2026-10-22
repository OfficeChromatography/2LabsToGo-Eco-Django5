#This file must be in the folder 2LabsToGo-Eco-Software/app

#import os
import os
#import glob
import glob

#delete 0001_initial.py in migrations of connection, sampleapp, finecontrol, development, detection
if os.path.exists("./connection/migrations/0001_initial.py"):
  os.remove("./connection/migrations/0001_initial.py")
else:
  print("The file does not exist")

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
