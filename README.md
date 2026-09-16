# Guitar Improvisation Quest (GIQ) — V3

Aplicação web estática e orientada a dados para o domínio sistemático e musical da improvisação na guitarra. 

O curso é fundamentado no princípio:
> *"Eu sei onde estou, sei qual intervalo estou tocando, sei como ele soa sobre o acorde e consigo escolher conscientemente se quero repouso ou tensão."*

---

## 🎯 Objetivo do Projeto

Migrar de uma visualização mecânica de escalas no instrumento para um **mapa consciente de relações intervalares e chord tones**.

A aplicação organiza o estudo em dois blocos diários distintos e complementares de 30 minutos:
1. **Bloco 1 (30 min)**: Teoria, Treino de Ouvido e Improvisação Guiada sobre a harmonia.
2. **Bloco 2 (30 min)**: Prática Técnica, palhetada alternada, precisão de articulação e mudanças de posição.

---

## 📂 Estrutura do Repositório

```text
guitar-improv-quest/
│
├── index.html         # Estrutura semântica e interface da aplicação
├── app.js             # Arquitetura modular de dados, estado, player de áudio e renderização
├── style.css          # Design responsivo, tema escuro moderno e estilo para TABs
├── lessons.json       # Fonte oficial de dados das aulas (schema modular escalável)
├── README.md          # Documentação completa do projeto
├── .nojekyll          # Arquivo para desativar o processamento Jekyll no GitHub Pages
│
└── _backup-v2/        # Cópia de segurança local da versão anterior (V2 legado)
    ├── index.html
    ├── app.js
    ├── style.css
    ├── README.md
    └── .nojekyll
```

---

## 🚀 Como Rodar Localmente

Por utilizar a API `fetch()` para carregar `lessons.json`, o projeto não deve ser aberto diretamente pelo protocolo `file://`. Execute um servidor HTTP local simples:

```bash
# Navegue até a pasta do projeto
cd guitar-improv-quest

# Inicie o servidor HTTP com Python 3
python3 -m http.server 8000
```

Abra o seu navegador e acesse:
```
http://localhost:8000
```

---

## 📖 Currículo Oficial (Aulas 1 a 60)

### Semana 1: Domínio Profundo do Shape 1 (5ª casa)
- **Aula 1: Shape 1 como mapa de intervalos** — Verbalização dos graus, exercícios de tônicas e combinação 1 + 5.
- **Aula 2: 1, b3 e 5** — Esqueleto harmônico e chord tones de Am.
- **Aula 3: A quinta como segundo repouso** — Dinâmica de Pergunta (5) e Resposta (1) com espaço e silêncio.
- **Aula 4: b3: a identidade menor** — Contraste auditivo entre terça menor (C) e terça maior (C#); mapeamento expressivo.
- **Aula 5: b7 e 4 como tensão (Boss Battle Semana 1)** — Resoluções magnéticas b7→1 e 4→b3.

### Semana 2: Transferência para os Shapes 2 a 5 & Boss Battle 1
- **Aula 6: Shape 2: 1, b3 e 5** — Região da 7ª/8ª casa e conexões por slides horizontais.
- **Aula 7: Shape 3: chord tones sob comando** — Região da 9ª à 13ª casa, extensão do dedo 4 e arpejos.
- **Aula 8: Shape 4: pensar em destino** — Região da 12ª à 15ª casa (e posição aberta); planejamento da nota de repouso antes do ataque.
- **Aula 9: Shape 5 e conexão** — Região da 14ª à 17ª casa; o ciclo completo dos 5 shapes em continuidade melódica.
- **Aula 10: Boss Battle 1** — Avaliação de domínio global da Fase 1 em 5 desafios práticos.

### Semana 3: Tensão, Resolução e Hierarquia (Aulas 11 a 15)
- **Aula 11: A hierarquia das notas** — Compreensão dos diferentes pesos musicais (repouso, identidade, tensão) e destinos na escala.
- **Aula 12: A tensão da 4ª** — A gravidade melódica de D (4) em direção a C (b3), atrasando a resolução e bends lentos.
- **Aula 13: b7 → 1** — A atração magnética de G (b7) para a tônica A (1), resoluções com pausas e condução melódica.
- **Aula 14: Tensão sem resolução imediata** — A arte de criar expectativa estendida inserindo notas intermediárias e silêncio.
- **Aula 15: Boss Battle — Tensão e resolução** — Avaliação cronometrada em 5 blocos sobre Am dominando tensão e resolução.

### Semana 4: Fraseado (Aulas 16 a 20)
- **Aula 16: O poder do silêncio** — A música no espaço entre as notas; frases curtas intercaladas com pausas e respiração.
- **Aula 17: Motivos** — Desenvolvimento temático: repetição, variação e conclusão melódica (A → A' → A'').
- **Aula 18: Pergunta e resposta** — Estrutura de diálogo musical contrapondo tensão aberta e repouso conclusivo.
- **Aula 19: Bends como notas-alvo** — Intenção, calibração auditiva milimétrica de 1 tom e vibrato circular de sustentação.
- **Aula 20: Boss Battle — Fraseado** — Prova magna da Semana 4 combinando silêncio, motivos, diálogo, tensão e bends afinados.

### Semana 5: Relativa Maior/Menor e Pentatônica Maior (Aulas 21 a 25)
- **Aula 21: Relativa maior e menor** — O princípio de Am e C maior: território idêntico, centros de gravidade distintos.
- **Aula 22: Pentatônica maior** — A fórmula 1 – 2 – 3 – 5 – 6 de C maior e o esqueleto da tríade fundamental C – E – G.
- **Aula 23: A 3ª maior** — O interruptor harmônico luz/sombra: o contraste de meio tom entre C (b3) e C# (3) sobre a tônica A.
- **Aula 24: Improvisando em G maior** — A pentatônica maior no contexto rock clássico (G – A – B – D – E) e ancoragem em G/B/D.
- **Aula 25: Boss Battle — Maior vs menor** — Desafio de síntese emocional alternando conscientemente entre os universos maior e menor.

### Semana 6: Escala Maior (Aulas 26 a 30)
- **Aula 26: Da pentatônica para a escala maior** — A construção orgânica da escala diatônica adicionando apenas a 4ª e a 7ª à pentatônica maior.
- **Aula 27: A 4ª — tensão e resolução para a 3ª** — A suspensão clássica Sus4 (C) e sua resolução suave de semitom descendente para a 3ª maior (B) em G.
- **Aula 28: A 7ª — tensão e resolução para a tônica** — O magnetismo irresistível da sensível F# puxando para o repouso absoluto na tônica G.
- **Aula 29: A função das 7 notas** — A visão holística da escala: Pilares (1, 3, 5), Cores (2, 6) e Tensões Dinâmicas (4, 7).
- **Aula 30: Boss Battle — Escala maior** — Formatura magna da Fase 1 demonstrando maestria diatônica e fraseado musical com as 7 notas.

### Semana 7: Acordes e Notas-Alvo (Aulas 31 a 38)
- **Aula 31: O acorde dentro da escala** — A harmonia nasce da melodia: a tríade G – B – D extraída do território diatônico de G.
- **Aula 32: Notas do acorde como destinos** — Mudança de mentalidade: antecipação do alvo harmônico antes de tocar a frase.
- **Aula 33: Escala como caminho, acorde como destino** — A escala como meio de transporte fluido até os destinos G, B e D.
- **Aula 34: G → C** — Acompanhamento harmônico em tempo real: condução de vozes mais próxima na 3ª casa (G=G, B→C, D→E).
- **Aula 35: G → C → D** — A progressão I – IV – V clássica, mapeamento de D maior e o papel estelar da sensível F#.
- **Aula 36: Notas de aproximação** — Embelezamento melódico por aproximações diatônicas e semitonais vizinhas (C→B, F#→G).
- **Aula 37: Pentatônica + notas do acorde** — Casamento perfeito entre a linguagem pentatônica blues/rock e a intenção harmônica.
- **Aula 38: Boss Battle — G → C → D → G** — Prova magna da Semana 7 improvisando conectado aos acordes da progressão.

### Semana 8: CAGED como Mapa Harmônico (Aulas 39 e 40)
- **Aula 39: Para que serve o CAGED?** — Desmistificando o CAGED: um mapa visual para localizar a estrutura dos acordes dentro da escala.
- **Aula 40: Tríade como esqueleto** — A síntese definitiva da Fase 2: Tríade (Esqueleto) + Escala (Território) = Maestria Total.

### Semana 9: Navegação Horizontal (Aulas 41 a 45)
- **Aula 41: Uma corda — enxergando horizontalmente** — Libertação dos blocos verticais: navegando a escala diatônica de G em uma única corda e localizando os 7 graus linearmente.
- **Aula 42: Duas cordas — construindo frases horizontais** — Fusão do movimento horizontal com cruzamento de cordas adjacentes (B e e) ancorando em chord tones G, B e D.
- **Aula 43: Conectando duas regiões** — Conectando a Região 1 (casas 2–5) à Região 2 (casas 7–10) através de slides com intenção melódica.
- **Aula 44: Posição muda por uma razão musical** — Mudança de posição deliberada para expansão de registro, aumento de intensidade e continuidade de motivos.
- **Aula 45: Três regiões** — Domínio unificado de 3 regiões contíguas (casas 2–5, 7–10, 12–15) atravessando o braço da guitarra sem perder o centro tonal.

### Semana 10: Navegação + 3NPS (Aulas 46 a 50)
- **Aula 46: Um motivo atravessando o braço** — Condução temática: transposição do mesmo motivo de 3–5 notas através de três regiões diferentes com pequenas variações.
- **Aula 47: Registro e intensidade** — A arquitetura dinâmica do solo: arco narrativo de três etapas (grave → médio → agudo → retorno).
- **Aula 48: Boss Battle — Navegação horizontal** — O grande teste prático de travessia do braço sobre a progressão G – C – D – G aplicando slides, motivos e controle tonal.
- **Aula 49: Por que 3NPS?** — Desmistificando o sistema 3 Notes Per String como ferramenta de fluência geométrica e alternate picking sem substituir os chord tones.
- **Aula 50: 3NPS — primeiro padrão** — O primeiro padrão 3NPS completo em G maior (3 notas por corda nas 6 cordas) com consciência intervalar, afinação e precisão rítmica.

### Semana 11: 3NPS + Sequências + Velocidade (Aulas 51 a 55)
- **Aula 51: Sequências de 3** — Organização do padrão 3NPS em células melódicas de 3 notas (1-2-3, 2-3-4, 3-4-5...) criando impulsos rítmicos articulados.
- **Aula 52: Grupos de 4** — Subdivisão em semicolcheias (1-2-3-4, 2-3-4-5...) e treino de precisão no cruzamento de cordas com a palheta.
- **Aula 53: Alternate picking + 3NPS** — Mecânica estrita de palhetada alternada contínua com números ímpares de notas por corda, priorizando relaxamento e sincronização.
- **Aula 54: Bursts — velocidade em pequenas doses** — Acelerações pontuais de 3 a 6 notas com parada e relaxamento imediato: Lento → Rápido → Pausa → Lento.
- **Aula 55: Legato + 3NPS** — Fusão do 3NPS com hammer-ons e pull-offs (1 palhetada + 2 ligaduras por corda) alternando ataques percussivos e fluidez líquida.

### Semana 12: Velocidade Musical + Final Boss (Aulas 56 a 60)
- **Aula 56: Velocidade como contraste** — A dinâmica entre o lirismo melódico e a aceleração virtuosa pontual (regra de 80% fraseado / 20% velocidade).
- **Aula 57: Acentos e controle rítmico** — Transformando sequências técnicas em linguagem viva através do deslocamento de ênfases métricas e dinâmicas.
- **Aula 58: Técnica + fraseado** — A convergência estética de todos os recursos (pentatônica, escala maior, chord tones, 3NPS, bends, vibrato, silêncio) a serviço da música.
- **Aula 59: Preparação para o Final Boss** — Simulado em 5 blocos cronometrados revisando os 18 pilares do curso e diagnosticando pontos fracos.
- **Aula 60: FINAL BOSS — Guitar Improvisation Quest** — A Prova Máxima em 10 Fases consagrando o domínio integral do Nível 1: consciência, liberdade e expressão musical.

---

## ➕ Adding a New Lesson (Como Adicionar Novas Aulas)

A arquitetura do V3 foi desenhada para permitir adicionar as **Aulas 61 a 70+** sem alterar **nenhuma linha de código em `app.js` ou `index.html`**.

Para incluir uma nova aula, basta adicionar um novo objeto ao array `lessons` dentro de `lessons.json`:

```json
{
  "id": 11,
  "week": 3,
  "day": 1,
  "title": "Título da Nova Aula",
  "subtitle": "Subtítulo explicativo conciso",
  "objective": "Objetivo pedagógico claro e específico.",
  "prerequisite": "Pré-requisito para iniciar esta aula.",
  "concept": "Conceito teórico e musical explicado sem jargões vazios.",
  "key": "A minor",
  "scale": {
    "name": "A minor pentatonic",
    "formula": ["1", "b3", "4", "5", "b7"],
    "notes": ["A", "C", "D", "E", "G"]
  },
  "fretboard": {
    "shape": 1,
    "position": 5,
    "intervalMap": "e|--1-----b3--\nB|--5-----b7--\n...",
    "tab": "e|--5-8---|\nB|--5-8---|\n..."
  },
  "exercises": [
    "Exercício específico 1 com instrução clara de execução.",
    "Exercício específico 2 focado em tempo e ritmo."
  ],
  "earTraining": {
    "instruction": "Instrução de percepção auditiva e afinação vocal."
  },
  "improvisation": {
    "instruction": "Roteiro detalhado para improvisar com backing track ou metrônomo."
  },
  "technicalPractice": {
    "duration": "30 minutos",
    "focus": "Foco motor e biomecânico",
    "routine": [
      "00–10 min: Aquecimento lento a 60 BPM.",
      "10–20 min: Desenvolvimento rítmico a 80 BPM.",
      "20–30 min: Aplicação com metrônomo a 95 BPM."
    ]
  },
  "backingTrack": {
    "title": "Backing track em Am",
    "url": null,
    "type": "search-required"
  },
  "video": null,
  "commonMistakes": [
    "Erro comum 1 a ser evitado.",
    "Erro comum 2 de postura ou ritmo."
  ],
  "mastery": {
    "know": "Critério para marcar Conheço.",
    "play": "Critério para marcar Consigo tocar.",
    "use": "Critério para marcar Consigo usar."
  },
  "mission": "Missão de gravação ou consolidação do dia.",
  "xp": {
    "know": 25,
    "play": 50,
    "use": 100
  }
}
```

O aplicativo detectará automaticamente a nova aula, criará as abas de semanas correspondentes e atualizará a barra de progresso.

---

## 💾 Persistência e LocalStorage (`giq-v3`)

Todo o progresso é salvo no navegador do usuário sob a chave isolada `giq-v3`, prevenindo conflitos com versões anteriores:

```json
{
  "version": 3,
  "xp": 350,
  "lastStudyDate": "2026-09-15",
  "streak": 3,
  "lessons": {
    "1": { "know": true, "play": true, "use": true },
    "2": { "know": true, "play": true, "use": false }
  },
  "quizAnswered": [0, 1]
}
```

- **Mastery Trifásico**:
  - 🟡 **Conheço** (`+25 XP`): Compreensão teórica e mapa mental dos intervalos.
  - 🟠 **Consigo tocar** (`+50 XP`): Execução motora limpa no andamento correto.
  - 🔵 **Consigo usar** (`+100 XP`): Aplicação espontânea e musical no improviso.
- **Nível**: Calculado dinamicamente através de `Math.floor(XP / 350) + 1`.
- **Streak**: Contabiliza dias consecutivos reais com atividade de estudo registrada.

---

## 🌐 Publicação no GitHub Pages

O projeto utiliza caminhos estritamente relativos (`./app.js`, `./style.css`, `./lessons.json`), sendo 100% compatível com a hospedagem em subdiretórios no GitHub Pages:

1. Suba os arquivos para o repositório no GitHub (`index.html` deve ficar na raiz).
2. No GitHub, acesse **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main` e pasta `/(root)`.
4. Salve. O endereço oficial publicado é:
   `https://migmac4.github.io/guitar-improv-quest/`
