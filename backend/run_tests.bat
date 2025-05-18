@echo off

REM Ativa o ambiente virtual (se estiver usando um)
REM call venv\Scripts\activate

REM Executa os testes com cobertura
pytest --cov=app --cov-report=term-missing

REM Desativa o ambiente virtual (se estiver usando um)
REM call deactivate 