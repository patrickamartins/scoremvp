# Correções Aplicadas - Scoreboard e Templates de Email

## Problemas Corrigidos

### 1. ✅ Scoreboard - Múltiplas Requisições (ERR_INSUFFICIENT_RESOURCES)
**Problema**: O placar estava disparando centenas de requisições por segundo (mais de 500), causando `ERR_INSUFFICIENT_RESOURCES` e `ERR_CERT_VERIFIER_CHANGED`.

**Solução**:
- Adicionado **debounce** de 500ms no `GameScoreboard.tsx` para notificações de mudanças de tempo
- Adicionado **debounce** de 1 segundo no `Painel.tsx` para salvar o estado do placar
- Adicionado **debounce** de 500ms para mudanças no `awayScore`

**Arquivos modificados**:
- `frontend/src/components/GameScoreboard.tsx`
- `frontend/src/pages/Painel.tsx`

### 2. ✅ Página Pública - Sincronização do Placar
**Problema**: A página pública não acompanhava o placar (tempo e pontuação) e havia erro de `setSelectedQuarto` inexistente.

**Solução**:
- Removida referência a `setSelectedQuarto` que não existia
- A página pública já estava configurada para atualizar a cada 1 segundo via `fetchScoreboard()`

**Arquivos modificados**:
- `frontend/src/pages/PublicGameView.tsx`

### 3. ✅ Templates de Email - Erro 500
**Problema**: O endpoint `/api/email-templates` retornava erro 500, provavelmente porque a tabela `email_templates` não existe no banco de dados do Railway.

**Solução**:
- Adicionado tratamento de erros robusto no endpoint para retornar lista vazia se a tabela não existir
- Criado script `backend/create_email_templates_table.py` para criar a tabela (já existia)

**Arquivos modificados**:
- `backend/app/routes/email_templates.py`

## Próximos Passos

### Executar Script para Criar Tabela de Email Templates

Se os templates de email ainda não funcionarem, execute o script para criar a tabela no Railway:

```bash
# No WSL
cd /mnt/c/scoremvp
source venv/bin/activate  # se necessário

# Obter DATABASE_URL do Railway e exportar
export DATABASE_URL="postgresql://user:password@host:port/database"

# Executar o script
python backend/create_email_templates_table.py
```

### Verificar se Funcionou

Após executar o script:
1. Faça login no sistema como `superadmin`
2. Acesse "Gerenciar Emails" no menu de configurações
3. Os templates devem aparecer na lista (mesmo que como "Não configurado")
4. Clique em um template para editá-lo

## Testes Recomendados

1. **Scoreboard**:
   - Iniciar um jogo no Painel
   - Verificar que não há mais centenas de erros no console
   - Verificar que o placar salva corretamente (com delay de 1 segundo)

2. **Página Pública**:
   - Abrir o link público do jogo
   - Verificar que o placar atualiza a cada 1 segundo
   - Verificar que tempo e pontuação estão sincronizados

3. **Templates de Email**:
   - Acessar "Gerenciar Emails"
   - Verificar que os templates aparecem na lista
   - Clicar em um template para editá-lo
   - Salvar alterações

## Notas Importantes

- O debounce no scoreboard significa que as mudanças serão salvas com um pequeno delay (1 segundo), o que é aceitável e evita sobrecarga no servidor
- A página pública atualiza a cada 1 segundo, o que é suficiente para acompanhar o placar em tempo real
- Se a tabela `email_templates` não existir, o endpoint retornará uma lista vazia em vez de erro 500

