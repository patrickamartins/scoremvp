#!/bin/bash
# Script para remover chaves secretas do histórico do Git

set -e

echo "🔍 Verificando histórico..."
COMMIT_PROBLEM=$(git log --oneline | grep -m1 "e20ece9" | cut -d' ' -f1 || echo "")

if [ -z "$COMMIT_PROBLEM" ]; then
    echo "⚠️  Commit problemático não encontrado no histórico local"
    echo "📋 Tentando remover arquivos problemáticos do índice..."
    
    # Remover arquivos problemáticos do índice
    git rm --cached backend/.env.backup 2>/dev/null || true
    
    echo "✅ Arquivos removidos do índice"
    echo ""
    echo "📝 Próximos passos:"
    echo "1. git add ."
    echo "2. git commit -m 'fix: remove chaves secretas'"
    echo "3. git push origin railway-deploy --force"
    exit 0
fi

echo "🔧 Commit problemático encontrado: $COMMIT_PROBLEM"
echo ""
echo "Escolha uma opção:"
echo "1) Usar git-filter-repo (recomendado - mais seguro)"
echo "2) Rebase interativo (mais controle)"
echo "3) Criar nova branch limpa (mais simples)"
read -p "Opção (1/2/3): " opcao

case $opcao in
    1)
        echo "📦 Verificando git-filter-repo..."
        if ! command -v git-filter-repo &> /dev/null; then
            echo "📥 Instalando git-filter-repo..."
            pip install git-filter-repo
        fi
        
        echo "🧹 Removendo arquivo .env.backup do histórico..."
        git filter-repo --path backend/.env.backup --invert-paths --force
        
        echo "✅ Limpeza concluída!"
        echo "📝 Próximo passo: git push origin railway-deploy --force"
        ;;
    2)
        echo "🔄 Iniciando rebase interativo..."
        git rebase -i ${COMMIT_PROBLEM}^
        echo "📝 No editor:"
        echo "   - Mude 'pick' para 'edit' no commit $COMMIT_PROBLEM"
        echo "   - Salve e feche"
        echo ""
        echo "Depois execute:"
        echo "   git rm --cached backend/.env.backup 2>/dev/null || true"
        echo "   git add SETUP_ENV_LOCAL.md backend/SETUP_ENV.md backend/create_env_files.ps1"
        echo "   git commit --amend --no-edit"
        echo "   git rebase --continue"
        echo "   git push origin railway-deploy --force"
        ;;
    3)
        echo "🆕 Criando nova branch limpa..."
        CURRENT_BRANCH=$(git branch --show-current)
        git checkout --orphan railway-deploy-clean
        
        echo "📦 Adicionando arquivos (exceto problemáticos)..."
        git add .
        git rm --cached backend/.env.backup 2>/dev/null || true
        
        echo "💾 Fazendo commit inicial..."
        git commit -m "feat: versão limpa sem chaves secretas"
        
        echo "🔄 Substituindo branch antiga..."
        git branch -D railway-deploy 2>/dev/null || true
        git branch -m railway-deploy
        
        echo "✅ Nova branch criada!"
        echo "📝 Próximo passo: git push origin railway-deploy --force"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

