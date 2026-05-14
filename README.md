# Sistema de Controle Tático Pro

Versão **v2.1 UX** do protótipo, mantendo a mecânica principal do sistema e aplicando melhorias de clareza, navegação e prevenção de erro.

## Estrutura

```text
index.html
assets/
  css/
    styles.css
  tailwind/
    tailwind.config.js
  js/
    app.js
  img/
    .gitkeep
docs/
```

## Como executar

Abra o arquivo `index.html` no navegador.

> As bibliotecas externas continuam via CDN. Para funcionar 100%, mantenha conexão com internet ao abrir o protótipo.

## Melhorias aplicadas nesta versão

- Dashboard com cards clicáveis e atalhos operacionais.
- Tabela do dashboard com coluna de **próximo passo**.
- Cards de execução com prioridade, critério de aceite e prazo contextual.
- Filtros em **Minhas Execuções** por status e prioridade.
- Filtros na área da Direção por status, prioridade e prazo.
- Mesa de trabalho da ficha com orientação clara sobre a próxima ação.
- Textos auxiliares no formulário de nova ficha.
- Validações adicionais de UX para datas, obra vinculada e custo estimado.
- Confirmação antes de ações críticas como reprovar, devolver e baixar.
- Correção da navegação mobile para fechar a sidebar sem alternar o estado indevidamente.
- Tabelas adaptadas para leitura em formato de cards no mobile.
- Organização visual com microcopy e estados vazios mais explicativos.

## O que não foi alterado

- Workflow principal da ficha.
- Status principais.
- Armazenamento em `localStorage`.
- Estrutura de dados atual.
- Simulação de usuários.
- Integração Supabase permanece apenas inicializada, sem persistência real ainda.

## Próximo passo recomendado

A próxima etapa técnica deve ser transformar o armazenamento local em persistência real no Supabase, com autenticação, perfis, permissões e histórico/auditoria das mudanças de status.


## Correção de contraste

Esta versão inclui uma camada de acessibilidade em `assets/css/styles.css` para garantir leitura correta mesmo quando a configuração customizada do Tailwind CDN não é processada imediatamente.

Também foi ajustada a ordem de carregamento no `index.html`:

1. Tailwind CDN
2. Configuração customizada do Tailwind
3. CSS próprio do projeto

Isso corrige problemas de classes como `bg-sidebar`, `bg-brand-600` e `text-brand-400` não serem aplicadas corretamente.
