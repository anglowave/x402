@echo off
echo Fixing Python pip installation...
echo.

python -m ensurepip --default-pip
echo.

echo Upgrading pip...
python -m pip install --upgrade pip
echo.

echo Installing gateway dependencies...
python -m pip install flask flask-cors requests
echo.

echo Done! Now you can run: python server.py
pause

