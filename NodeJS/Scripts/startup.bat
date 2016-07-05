@echo off

Rem only need to set the below two directory paths
set KAFKA_DIR=C:\kafka\bin\windows
set NODE_PRODUCER_DIR=D:\mobile-analytics\NodeJS\Scripts

set NODE_CONSUMER_DIR=%NODE_PRODUCER_DIR%\consumer

cd %KAFKA_DIR%
start cmd /k zookeeper-server-start.bat C:\kafka\config\zookeeper.properties
ping 127.0.0.1 -n 5 > nul
start cmd /k kafka-server-start.bat C:\kafka\config\server.properties
ping 127.0.0.1 -n 5 > nul

cd /d %NODE_PRODUCER_DIR%
start cmd /k node server.js

cd %NODE_CONSUMER_DIR%
start cmd /k node index.js

echo "Successfully executed all the scripts"
