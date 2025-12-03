# Solução Definitiva para Remover Secretos do Histórico

## 🚨 Situação Atual

- Há um rebase em andamento que precisa ser abortado
- O arquivo `backend/.env.backup` existe e contém chaves secretas
- O commit `e20ece9` ainda está no histórico com as chaves

## ✅ Solução: Usar git-filter-repo (Recomendado)

Execute estes comandos **na ordem**:

```bash
cd /mnt/c/scoremvp

# 1. Abortar rebase em andamento
git rebase --abort

# 2. Remover arquivo .env.backup se existir
rm -f backend/.env.backup

# 3. Instalar git-filter-repo (se não tiver)
pip install git-filter-repo

# 4. Remover arquivo .env.backup do histórico completo
git filter-repo --path backend/.env.backup --invert-paths --force

# 5. Substituir chave secreta no histórico de TODOS os arquivos
git filter-repo --replace-text <(echo 'sk_test_REMOVED_FROM_HISTORY==>sk_test_your_stripe_secret_key_here') --force

# 6. Verificar se funcionou
git log --all --full-history -- "**/SETUP_ENV_LOCAL.md" | head -20

# 7. Force push
git push origin railway-deploy --force
```

## 🔄 Alternativa: Criar Nova Branch Limpa

Se o git-filter-repo não funcionar ou der muito trabalho:

```bash
cd /mnt/c/scoremvp

# 1. Abortar rebase
git rebase --abort

# 2. Ver commits antes do problemático
git log --oneline | grep -B2 "e20ece9"

# 3. Fazer checkout do commit ANTES de e20ece9
# (Substitua f40a3f4 pelo hash do commit anterior a e20ece9)
git checkout -b railway-deploy-clean f40a3f4

# 4. Remover arquivo problemático
rm -f backend/.env.backup

# 5. Aplicar todas as mudanças atuais (cherry-pick dos commits bons)
# Primeiro, veja quais commits são bons (depois de e20ece9)
git log --oneline railway-deploy | grep -A10 "e20ece9"

# 6. Cherry-pick dos commits bons (substitua pelos hashes reais)
git cherry-pick 0b8f4e1  # O commit de correção

# 7. Adicionar todas as mudanças atuais
git add .
git commit -m "feat: atualizações completas do sistema sem chaves secretas"

# 8. Substituir branch antiga
git branch -D railway-deploy
git branch -m railway-deploy

# 9. Force push
git push origin railway-deploy --force
```

## 🎯 Solução Mais Simples (Se as outras não funcionarem)

Usar a URL fornecida pelo GitHub para permitir temporariamente (NÃO RECOMENDADO, mas funciona):

1. Acesse: https://github.com/patrickamartins/scoremvp/security/secret-scanning/unblock-secret/36J3a09Ta7UPzrRvCCO16VbaHLo
2. Clique em "Allow secret" (permitir secret)
3. Faça o push novamente: `git push origin railway-deploy`

**⚠️ IMPORTANTE**: Depois de fazer push, você DEVE:
- Revogar a chave no Stripe Dashboard
- Criar uma nova chave
- Atualizar no Railway

