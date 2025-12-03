# Comandos Exatos para Corrigir o Push

## 🚀 Execute estes comandos no WSL (um por vez)

```bash
# 1. Navegar para o diretório
cd /mnt/c/scoremvp

# 2. Verificar branch atual
git branch

# 3. Iniciar rebase interativo (vai abrir um editor)
git rebase -i e20ece900eab696dfe23f7c82c4dcb3abf777eae^
```

### No editor que abrir (nano):

1. Você verá algo como:
   ```
   pick e20ece9 feat: atualizações do sistema...
   pick 0b8f4e1 fix: remove chaves secretas...
   ```

2. **Mude a primeira linha** de `pick` para `edit`:
   ```
   edit e20ece9 feat: atualizações do sistema...
   pick 0b8f4e1 fix: remove chaves secretas...
   ```

3. Salve e saia:
   - Pressione `Ctrl+X`
   - Pressione `Y` (para confirmar)
   - Pressione `Enter`

### Continuar no terminal:

```bash
# 4. Remover arquivo problemático
git rm --cached backend/.env.backup 2>/dev/null || true

# 5. Adicionar versões corrigidas (já foram corrigidas nos arquivos)
git add SETUP_ENV_LOCAL.md backend/SETUP_ENV.md backend/create_env_files.ps1

# 6. Fazer amend do commit (substitui o commit problemático)
git commit --amend --no-edit

# 7. Continuar o rebase
git rebase --continue

# 8. Se aparecer algum conflito, resolva e continue:
#    git add .
#    git rebase --continue

# 9. Force push (vai sobrescrever o histórico remoto)
git push origin railway-deploy --force
```

## ⚠️ IMPORTANTE ANTES DO FORCE PUSH

1. **Certifique-se** de que ninguém mais está trabalhando na branch `railway-deploy`
2. **Revogue as chaves** no Stripe Dashboard:
   - Acesse: https://dashboard.stripe.com/test/apikeys
   - Revogue: `sk_test_51RN6g1C4MzjUUyB7...`
   - Crie uma nova chave de teste
   - Atualize no Railway

## 🔄 Alternativa Mais Simples (Se o Rebase Der Problema)

Se o rebase der muito trabalho, você pode criar uma nova branch limpa:

```bash
# 1. Ver commits limpos (antes do problemático)
git log --oneline | grep -A5 "e20ece9"

# 2. Fazer checkout do commit ANTES do problemático
# (Substitua COMMIT_ANTERIOR pelo hash do commit antes de e20ece9)
git checkout -b railway-deploy-clean <COMMIT_ANTERIOR>

# 3. Aplicar mudanças atuais (cherry-pick dos commits bons)
git cherry-pick 0b8f4e1  # O commit de correção

# 4. Adicionar todas as mudanças atuais
git add .
git commit -m "feat: atualizações completas do sistema"

# 5. Substituir branch antiga
git branch -D railway-deploy
git branch -m railway-deploy

# 6. Force push
git push origin railway-deploy --force
```

## ✅ Após o Push Bem-Sucedido

1. Verifique se o push funcionou
2. Revogue as chaves antigas no Stripe
3. Crie novas chaves
4. Atualize as variáveis de ambiente no Railway

