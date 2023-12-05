#!/bin/bash

# Command to run the Python server
python server.py &

# Command to run the Node.js server
cd corsserver
node server.js

