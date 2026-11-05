# Deploy único do PokApp no Vercel

O repositório é implantado como um único projeto Vercel, pela raiz `.`. O `serve.js` fica em `BackEnd/serve.js`: ele entrega a API Express em `/api` e serve o build do FrontEnd; as demais rotas Vue Router recebem `index.html`.

## Configuração

1. Importe este repositório como um projeto no Vercel.
2. Configure **Root Directory** como `.` (raiz do repositório).
3. Deixe o Vercel usar o `vercel.json` da raiz: instalar dependências, compilar o FrontEnd e encaminhar as requisições para `BackEnd/serve.js`.
4. Faça o deploy. A API fica disponível no mesmo domínio em `/api/health` e `/api/tcgdex/...`.

`BackEnd/vercel.json` e `FrontEnd/vercel.json` ficam junto aos respectivos códigos, como nos outros projetos. Para este deploy único, o Vercel lê o arquivo da raiz, que inclui a função do BackEnd e os arquivos compilados do FrontEnd.

Localmente, continue iniciando `BackEnd` e `FrontEnd` separadamente como descrito em `BackEnd/README.md`; o proxy do Vite encaminha `/api` para o servidor local.
