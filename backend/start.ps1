$env:PYTHONPATH = "$env:PYTHONPATH;$(Get-Location)"
uvicorn app.main:app --reload 