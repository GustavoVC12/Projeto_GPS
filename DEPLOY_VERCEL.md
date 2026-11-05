# Deploy único do PokApp no Vercel

O repositório é implantado como um único projeto Vercel, pela raiz `.`. A função `serve.js` entrega a API Express em `/api` e também serve o build do FrontEnd; as demais rotas Vue Router recebem `index.html`.

## Configuração

1. Importe este repositório como um projeto no Vercel.
2. Configure **Root Directory** como `.` (raiz do repositório).
3. Deixe o Vercel usar as definições de `vercel.json`: instalar dependências, compilar o FrontEnd e encaminhar as requisições para `serve.js`.
4. Faça o deploy. A API fica disponível no mesmo domínio em `/api/health` e `/api/tcgdex/...`.

Localmente, continue iniciando `BackEnd` e `FrontEnd` separadamente como descrito em `BackEnd/README.md`; o proxy do Vite encaminha `/api` para o servidor local.
