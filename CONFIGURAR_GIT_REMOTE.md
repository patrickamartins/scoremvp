# Configurar Remote do Git

## 🔍 Verificar Remotes Atuais

```bash
cd /mnt/c/scoremvp
git remote -v
```

## ➕ Adicionar Remote Origin

Se não houver nenhum remote, adicione:

```bash
# Adicionar remote origin
git remote add origin https://github.com/patrickamartins/scoremvp.git

# Verificar se foi adicionado
git remote -v
```

## 🔄 Se o Remote Já Existir com Nome Diferente

Se o remote tiver outro nome (não 'origin'), você pode:

### Opção 1: Renomear o remote
```bash
# Ver remotes
git remote -v

# Renomear (substitua 'outro-nome' pelo nome atual)
git remote rename outro-nome origin
```

### Opção 2: Usar o nome do remote existente
```bash
# Ver remotes
git remote -v

# Usar o nome que aparecer (ex: se for 'upstream')
git push upstream railway-deploy --force
```

## ✅ Após Configurar o Remote

```bash
# Verificar
git remote -v

# Deve mostrar algo como:
# origin  https://github.com/patrickamartins/scoremvp.git (fetch)
# origin  https://github.com/patrickamartins/scoremvp.git (push)

# Então fazer o push
git push origin railway-deploy --force
```

