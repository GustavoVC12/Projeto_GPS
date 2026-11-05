# Deploy do PokApp no Vercel

O repositório contém dois projetos independentes. Importe o mesmo repositório duas vezes no Vercel e configure um Root Directory diferente para cada projeto.

## 1. Publicar o BackEnd

1. Crie um projeto Vercel apontando para este repositório.
2. Em **Root Directory**, selecione `BackEnd`.
3. Mantenha o preset Node.js/Other com o comando de instalação padrão. O Vercel detecta a aplicação Express exportada em `BackEnd/index.js`.
4. Faça o deploy e copie o domínio gerado, por exemplo `https://pokapp-backend.vercel.app`.
5. Confira o serviço abrindo `/api/health` nesse domínio.

## 2. Publicar o FrontEnd

1. Crie outro projeto Vercel usando o mesmo repositório.
2. Em **Root Directory**, selecione `FrontEnd`.
3. Use o preset **Vite**. O comando de build é `npm run build` e a pasta de saída é `dist`.
4. Em **Environment Variables**, crie `VITE_API_URL` com o domínio do BackEnd mais `/api`, por exemplo `https://pokapp-backend.vercel.app/api`.
5. Faça o deploy. Se alterar a variável depois, crie um novo deploy para incorporá-la ao bundle do Vite.

O arquivo `FrontEnd/vercel.json` envia rotas da aplicação Vue Router para `index.html`. Em desenvolvimento local, o Vite continua encaminhando `/api` para `http://localhost:3000`.
