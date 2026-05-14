# Melhorias de UI/UX aplicadas

## Objetivo

Melhorar a experiência do usuário sem modificar a lógica fundamental do protótipo.

## Áreas alteradas

### Dashboard

- Cards de KPI agora funcionam como atalhos.
- Tabela passou a mostrar o próximo passo esperado.
- Mensagens explicam melhor o que cada número significa.

### Minhas Execuções

- Adicionados filtros por status e prioridade.
- Cards exibem prioridade, critério de aceite, status, próximo passo e prazo contextual.
- Ordenação prioriza fichas vencidas, alta prioridade e prazo mais próximo.

### Administração

- Adicionados filtros por status, prioridade e prazo.
- Tabela exibe próximo passo da ficha.
- Estados vazios explicam melhor o motivo da ausência de dados.

### Formulário

- Adicionado roteiro visual de preenchimento.
- Adicionados textos de ajuda nos campos críticos.
- Adicionadas validações de datas, obra vinculada e custos.

### Detalhes da ficha

- Cabeçalho mostra próximo passo e situação do prazo.
- Mesa de trabalho mostra status, prazo e ação esperada.
- Ações críticas pedem confirmação.

### Mobile

- Tabelas usam apresentação em cartões.
- Sidebar fecha corretamente ao navegar.


## Ajuste adicional: contraste e legibilidade

Foi adicionada uma camada CSS de proteção para garantir contraste adequado em:

- sidebar;
- textos secundários;
- botões principais;
- inputs, selects e textareas;
- badges de status;
- tabelas;
- toasts.

A lógica da aplicação não foi alterada.
