@echo off
set PYTHONPATH=%PYTHONPATH%;%CD%
uvicorn app.main:app --reload 