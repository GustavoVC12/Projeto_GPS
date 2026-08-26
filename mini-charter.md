# Atividade - Definição do Projeto e Mini-Charter

**Disciplina:** Gerência de Projetos de Software\
**Duração prevista:** 1h30\
**Entrega da aula:** Mini-Charter do projeto\
**Grupo:** PokApp\
**Integrantes:**
Gustavo Gomes, Laís Schmitz, Matheus Santos e Raquel Neres\

------------------------------------------------------------------------
# Etapa 1 - Formação da equipe e escolha do domínio

## 1.1 Integrantes
1.  Gustavo Gomes
2.  Laís Schmitz
3.  Matheus Santos
4.  Raquel Neres

## 1.2 Domínio ou área escolhida
Desenvolvimento de software para gestão de coleções digitais e análise probabilística voltada ao jogo Pokémon TCG Pocket.

## 1.3 Problema inicialmente identificado
Ausência de uma ferramenta integrada que permita o rastreamento da coleção do usuário e forneça dados estatísticos precisos sobre a probabilidade de aquisição de novas cartas, dificultando a otimização de recursos limitados dentro do jogo.

------------------------------------------------------------------------

## 1.4 Quem enfrenta esse problema?
Jogadores *Free-to-Play* (F2P) que possuem recursos diários limitados (como o limite de pacotes gratuitos) e buscam maximizar a eficiência na obtenção de cartas para completar coleções ou montar decks competitivos de forma paritária aos jogadores *Pay-to-Win* (P2W).

------------------------------------------------------------------------

## 1.5 Por que esse problema merece ser resolvido?
Para democratizar o cenário competitivo do jogo, reduzindo a expressiva discrepância de progressão entre jogadores que investem financeiramente e aqueles que utilizam apenas os recursos gratuitos, otimizando assim a experiência de colecionismo e a tomada de decisão estratégica do usuário.

------------------------------------------------------------------------

# Etapa 2 - Pesquisa e compreensão do problema

## 2.1 Descobertas relevantes

**Descoberta 1**

Transparência das taxas de *drop*: O jogo disponibiliza publicamente as probabilidades exatas de obtenção de cada carta, o que viabiliza a implementação de algoritmos de cálculo determinístico e probabilístico no sistema com alta confiabilidade.

------------------------------------------------------------------------

**Descoberta 2**

Disponibilidade de dados externos: Existe uma API pública devidamente estruturada que fornece metadados e imagens em alta resolução de todas as cartas já lançadas, otimizando o processo de carga de dados do sistema e poupando esforço de catalogação manual.

------------------------------------------------------------------------

**Descoberta 3**

Padrão de mercado: Plataformas similares focam fortemente em mecanismos avançados de busca e filtragem, indicando uma necessidade latente dos usuários por ferramentas de organização eficientes devido ao alto volume de dados (grande quantidade de expansões e cartas).

------------------------------------------------------------------------

## 2.2 Fontes consultadas

1.  Aplicativo Oficial Pokémon TCG Pocket (disponível nas plataformas digitais Play Store e App Store).

    ------------------------------------------------------------------------

2.  [Documentação da API Pública TCGDex](https://tcgdex.dev/tcg-pocket) - Fonte primária para obtenção da base de dados de cartas.

    ------------------------------------------------------------------------  

3.  [Plataforma TCG Sorted](https://tcgsorted.com/) - Sistema de referência utilizado para benchmarking de funcionalidades de catalogação.

------------------------------------------------------------------------  

## 2.3 Formulação do problema

**Problema: A dificuldade sistêmica dos jogadores *Free-to-Play* em otimizar o uso de seus recursos limitados para completar coleções e manter a competitividade contra usuários que realizam microtransações.**

------------------------------------------------------------------------

# Etapa 3 - Definição do projeto

## 3.1 Nome provisório do projeto: PokApp

------------------------------------------------------------------------

## 3.2 Solução proposta em alto nível

Uma aplicação que centralize as seguintes funcionalidades principais:

- Módulo de gerenciamento do inventário pessoal de cartas do usuário.
- Mecanismo de busca e filtragem avançada do catálogo completo.
- Motor de cálculo estatístico para recomendação automatizada do pacote ideal a ser aberto, maximizando a probabilidade matemática de obtenção de cartas inéditas.

------------------------------------------------------------------------

## 3.3 Beneficiários ou usuários principais

- Jogadores com foco em colecionismo (complecionistas) que buscam obter a totalidade das cartas lançadas.
- Jogadores focados no cenário competitivo, que buscam otimizar a obtenção de cartas específicas e fortes para a composição de seus decks.

------------------------------------------------------------------------

## 3.4 Síntese do projeto

> Nosso projeto pretende
> entregar uma plataforma analítica e de gestão
> para
> jogadores ativos de Pokémon TCG Pocket
> de modo a
> permitir o rastreamento prático de suas coleções e viabilizar a tomada de decisão baseada em dados, mitigando a desvantagem competitiva em relação aos usuários pagantes.

------------------------------------------------------------------------

# Etapa 4 - Construção do Mini-Charter

## 4.1 Problema / Justificativa

Que situação motiva a realização do projeto?

A significativa disparidade de progressão e poder competitivo entre usuários F2P e P2W, motivada pela ausência de ferramentas que auxiliem na otimização e alocação eficiente de recursos escassos (pacotes gratuitos).

## 4.2 Objetivo do projeto

O que o projeto pretende alcançar?

Desenvolver um sistema web integrado, escalável e de alta usabilidade que gerencie o progresso do usuário e processe dados probabilísticos para recomendar a melhor rota estratégica de abertura de pacotes.

------------------------------------------------------------------------

## 4.3 Métricas / Critérios de sucesso

| Métrica | Situação ou valor esperado |
|---|---|
| 1. Taxa de Aceitação (CSAT) | O gerenciador de coleções deve ser bem recebido, atingindo taxa de satisfação superior a 80%. |
| 2. Acurácia do Algoritmo | Os cálculos de probabilidade e recomendação devem ser 100% fiéis às taxas oficiais divulgadas. |
| 3. Desempenho do Sistema | O tempo médio de resposta nas buscas, filtragens e processamentos deve ser inferior a 2 segundos. |

## 4.4 Escopo inicial - IN

Quais são as principais capacidades ou entregas que **fazem parte** do
projeto?

-   [x] Módulo de cadastro e gerenciamento contínuo da coleção de cartas.
-   [x] Motor de cálculo probabilístico e sistema de recomendação de pacotes.
-   [x] Ferramentas de busca e filtragem do catálogo da API.

## 4.5 Escopo inicial - OUT

O que poderia ser confundido com parte do projeto, mas **explicitamente
não será contemplado** nesta versão?

-   [x] Plataforma de negociação (troca e venda) de cartas entre os usuários.
-   [x] Módulo de Deckbuilder (simulador de montagem de baralhos e partidas).
-   [x] Integração ou sincronização automática (bot) com as contas oficiais dos jogadores.

## 4.6 Stakeholders iniciais

| Stakeholder | Interesse / relação com o projeto |
|---|---|
| Jogadores de Pokémon TCG Pocket | Usuário Final: Interesse em otimizar recursos e gerenciar a coleção de forma eficiente. |
| Equipe de Desenvolvimento | Produtores: Responsáveis por especificar, implementar e entregar o software com qualidade. |
| Professor(a) da Disciplina | Avaliador: Interesse na correta aplicação técnica das boas práticas de Gerência de Projetos de Software. |

## 4.7 Premissas iniciais

O que o grupo está assumindo como verdadeiro para conseguir planejar o
projeto?

-   O público-alvo possui familiaridade prévia com a dinâmica de abertura de pacotes e com as mecânicas de coleção do Pokémon TCG Pocket.

    ------------------------------------------------------------------------

-   A API pública utilizada como fonte de dados se manterá acessível, gratuita e será atualizada em tempo hábil após o lançamento de novas expansões.

    ------------------------------------------------------------------------

-   Existe uma demanda real da comunidade por ferramentas analíticas externas e sistemas de gerenciamento em virtude da ausência nativa no aplicativo móvel.

    ------------------------------------------------------------------------

## 4.8 Restrições iniciais

Quais limitações já são conhecidas?

-   **Restrição de Arquitetura:** Devido à alta volumetria de dados possíveis (milhares de cartas), o sistema inicial em ambiente acadêmico suportará um limite pré-determinado de usuários para evitar custos excessivos de infraestrutura.

    ------------------------------------------------------------------------

-   **Restrição Tecnológica:** Como o jogo oficial não possui API de autenticação pública para extração de contas, o cadastro inicial e a manutenção das cartas adquiridas deverão ser realizados exclusivamente de forma manual pelo usuário.

    ------------------------------------------------------------------------

## 4.9 Principais riscos percebidos

-   **Risco de Retenção:** Baixa adesão por parte dos usuários devido ao atrito operacional exigido para registrar toda a coleção inicial manualmente.

    ------------------------------------------------------------------------

-   **Risco de Escalabilidade:** Crescimento exponencial e acelerado da base de dados, impactando os custos do banco e o desempenho das consultas.

    ------------------------------------------------------------------------

-   **Risco de Integridade de Dados:** Desalinhamento entre o inventário virtual do jogador e os registros no software por falha de entrada humana, o que comprometerá a acurácia dos relatórios e recomendações probabilísticas geradas.

    ------------------------------------------------------------------------

------------------------------------------------------------------------

# Etapa 5 - Teste de consistência e entrega

| Pergunta de verificação | Sim | Não |
|---|---|---|
| Está claro qual problema originou o projeto? | [X] | [ ] |
| O objetivo descreve um resultado, e não apenas "desenvolver um sistema"? | [X] | [ ] |
| Existem critérios que permitam avaliar o sucesso? | [X] | [ ] |
| O escopo IN está coerente com o objetivo? | [X] | [ ] |
| O escopo OUT estabelece uma fronteira real para o projeto? | [X] | [ ] |
| Os principais stakeholders foram identificados? | [X] | [ ] |
| Premissas e restrições não foram confundidas? | [X] | [ ] |
| O projeto parece realizável no contexto da disciplina? | [X] | [ ] |

------------------------------------------------------------------------
