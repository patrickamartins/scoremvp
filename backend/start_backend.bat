@echo off
echo Desativando ambiente virtual...
call deactivate

echo Removendo ambiente virtual...
rmdir /s /q venv

echo Criando novo ambiente virtual...
python -m venv venv

echo Ativando ambiente virtual...
call .\venv\Scripts\activate

echo Atualizando pip...
python -m pip install --upgrade pip

echo Instalando dependências...
pip install -r requirements.txt

if errorlevel 1 (
    echo Erro ao instalar dependências!
    pause
    exit /b 1
)

echo Iniciando o servidor backend...
python -m uvicorn app.main:app --reload --port 8000

if errorlevel 1 (
    echo Erro ao iniciar o servidor!
    pause
    exit /b 1
)