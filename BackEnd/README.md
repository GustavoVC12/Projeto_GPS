# PokApp BackEnd

API Express que entrega ao FrontEnd os dados de Pokémon TCG Pocket obtidos da TCGdex. A série `tcgp` mantém o catálogo restrito às cartas do Pocket. Respostas da TCGdex ficam em cache por cinco minutos para reduzir chamadas repetidas.

## Executar localmente

Em um terminal:

```powershell
cd BackEnd
npm run dev
```

O serviço inicia em `http://localhost:3000`. Em outro terminal, inicie o FrontEnd:

```powershell
cd FrontEnd
npm run dev
```

O Vite encaminha `/api` para o BackEnd local.

## Rotas

- `GET /api/health` — estado do serviço.
- `GET /api/tcgdex/sets?lang=pt` — expansões de Pokémon TCG Pocket.
- `GET /api/tcgdex/sets/:setId?lang=pt` — detalhes de uma expansão.
- `GET /api/tcgdex/sets/:setId/cards?lang=pt` — cartas completas da expansão.
- `GET /api/tcgdex/cards/:cardId?lang=pt` — detalhes de uma carta.

Idiomas aceitos: `pt` e `en`. Idiomas não reconhecidos usam português.
