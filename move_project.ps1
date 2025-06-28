# Script para mover o projeto para um caminho simples
# Resolve o problema de encoding UTF-8 causado por espaços no caminho

Write-Host "Movendo projeto para caminho simples..." -ForegroundColor Green

# Caminho atual (com espaços)
$currentPath = "C:\Users\Patrick Martins\Desktop\scoremvp"

# Caminho de destino (sem espaços)
$newPath = "C:\scoremvp"

# Verificar se o diretório de destino já existe
if (Test-Path $newPath) {
    Write-Host "Diretório de destino já existe. Removendo..." -ForegroundColor Yellow
    Remove-Item -Path $newPath -Recurse -Force
}

# Criar diretório de destino
New-Item -ItemType Directory -Path $newPath -Force

# Copiar todos os arquivos e pastas
Write-Host "Copiando arquivos..." -ForegroundColor Green
Copy-Item -Path "$currentPath\*" -Destination $newPath -Recurse -Force

# Verificar se a cópia foi bem-sucedida
if (Test-Path "$newPath\backend") {
    Write-Host "Projeto movido com sucesso para: $newPath" -ForegroundColor Green
    Write-Host "Agora você pode trabalhar no novo local sem problemas de encoding!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para continuar o desenvolvimento:" -ForegroundColor Cyan
    Write-Host "1. Navegue para: $newPath\backend" -ForegroundColor White
    Write-Host "2. Ative o ambiente virtual: .\venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "3. Teste a conexão: python test_minimal.py" -ForegroundColor White
} else {
    Write-Host "Erro ao mover o projeto!" -ForegroundColor Red
} 