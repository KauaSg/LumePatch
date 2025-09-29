# LumePatch

Guia rápido para rodar o projeto localmente.

## Requisitos
- Node.js LTS instalado (18 ou 20+ recomendado)
- npm (vem com o Node)

Verifique as versões no PowerShell:

```powershell
node -v
npm -v
```

## Instalar dependências

Este projeto usa Vite + React e algumas libs de IA. Instale as dependências:

```powershell
npm install --legacy-peer-deps
```

Observação: usamos `--legacy-peer-deps` para contornar conflitos de peerDependencies.

## API de persistencia local

Abra um terminal separado para subir a API de persistencia baseada em JSON Server:

```powershell
npm run api
```

O servico responde em http://localhost:3001. Se quiser apontar para outro backend, defina a variavel `VITE_API_URL` em um arquivo `.env` (ex.: `VITE_API_URL=https://sua-api.com`).
Quando a API nao estiver disponivel, a aplicacao usa automaticamente o fallback local (localStorage).

## Configurar itens

- Com o app rodando, acesse a aba **Gestao de Estoque**.
- Clique no icone de engrenagem em qualquer card para ajustar nome de exibicao, unidade, estoque minimo e validade (em dias).
- Ao adicionar estoque manualmente, informe a quantidade e, se quiser, uma data de validade (sugerimos uma com base no shelf life configurado).
- As configuracoes sao persistidas via JSON Server e usadas para os alertas e indicadores de validade/estoque.

## Rodar em modo desenvolvimento

Com a API rodando, inicie o servidor de desenvolvimento do Vite em outro terminal:

```powershell
npm run dev
```

Você verá um URL no terminal (por padrão http://localhost:5173). Abra no navegador.

Permita o acesso à câmera quando o navegador solicitar (a app usa `navigator.mediaDevices.getUserMedia`).

## Gerar build de produção (opcional)

```powershell
npm run build
```

## Visualizar build (preview)

Após o build, sirva a pasta `dist`:

```powershell
npm run preview
```

## Dicas e resolução de problemas
- Se a porta 5173 estiver ocupada, o Vite escolherá outra e mostrará no terminal.
- Caso o Node seja muito antigo, atualize para a versão LTS.
- Se algo falhar na instalação, tente limpar o cache e reinstalar:

```powershell
npm cache verify
Remove-Item -Recurse -Force node_modules package-lock.json
npm install --legacy-peer-deps
```

- Se a câmera não abrir: garanta que está acessando via `http://localhost` (HTTPS não é necessário no dev do Vite) e que o navegador tem permissão de câmera para o site.
