---
trigger: always_on
---

# 🚀 PROMPT OFICIAL — SOLARY DATA (WATTS)

## Sistema de Monitoramento + Geração Automática de Relatórios Fotovoltaicos

---

## 🧠 CONTEXTO

Você está construindo um sistema chamado **Solary Data (Watts)**.

Esse sistema tem como objetivo:

* Monitorar desempenho de sistemas fotovoltaicos
* Integrar dados via API (APsystems, Sungrow, GoodWe)
* Cruzar dados com faturas de energia
* Gerar relatórios automáticos em PDF
* Eliminar processos manuais e erros humanos
* Escalar para +200 clientes

---

## 🎯 OBJETIVO DO SISTEMA

Gerar automaticamente um **RELATÓRIO EXECUTIVO**, contendo:

1. Dados principais do projeto
2. Resultado financeiro
3. Resultado operacional (insights automáticos)
4. Payback
5. Créditos acumulados
6. Resultado total
7. Conclusão executiva

---

## 🧩 ESTRUTURA DE DADOS

Crie a seguinte estrutura base:

```json
{
  "cliente": {
    "nome": "",
    "local": ""
  },
  "projeto": {
    "investimento": 0,
    "data_ativacao": ""
  },
  "energia": {
    "geracao_kwh": [],
    "creditos_kwh": 0
  },
  "fatura": {
    "valor_atual": 0,
    "valor_antigo": 0,
    "valor_kwh": 0
  },
  "periodo": {
    "meses_ativo": 0,
    "ciclo_meses": 0
  }
}
```

---

## ⚙️ MOTOR DE CÁLCULO (OBRIGATÓRIO)

Implemente as seguintes funções:

### 1. Economia mensal

```js
economiaMensal = valor_antigo - valor_atual
```

---

### 2. Redução percentual

```js
reducaoPercentual = (economiaMensal / valor_antigo) * 100
```

---

### 3. Economia no ciclo

```js
economiaCiclo = economiaMensal * ciclo_meses
```

---

### 4. Valor dos créditos

```js
valorCreditos = creditos_kwh * valor_kwh
```

---

### 5. Payback

```js
paybackAnos = investimento / (economiaMensal * 12)
```

---

### 6. Resultado total

```js
resultadoTotal = economiaCiclo + valorCreditos
```

---

## 🧠 MOTOR DE INSIGHTS (INTELIGÊNCIA)

Gerar automaticamente textos com base nos dados:

```js
if (reducaoPercentual > 80) {
  insight += "Alta redução de custos"
}

if (paybackAnos < 3) {
  insight += "Retorno rápido do investimento"
}

if (creditos_kwh > 0) {
  insight += "Geração de créditos energéticos"
}
```

---

## 🧾 GERADOR DE RELATÓRIO

Monte automaticamente o relatório com esta estrutura:

---

### 1. Dados principais

* Tempo ativo
* Investimento
* Créditos (kWh)
* Valor do kWh

---

### 2. Resultado do projeto

* Fatura antiga
* Fatura atual
* Economia mensal
* Redução %
* Economia no ciclo

---

### 3. Resultado operacional

Texto gerado pelo motor de insights

---

### 4. Retorno do investimento

* Investimento
* Payback

---

### 5. Créditos acumulados

* kWh
* valor em R$

---

### 6. Resultado total

* Economia
* Créditos
* Total geral

---

### 7. Conclusão executiva

Gerar automaticamente com base nos indicadores:

Exemplo:

"O projeto apresenta alta economia, retorno rápido e geração consistente de créditos, demonstrando forte viabilidade financeira."

---

## 🔌 INTEGRAÇÃO COM APIs

Criar módulo para:

* Receber dados de geração (kWh) via API
* Mapear clientes por ID
* Atualizar dados automaticamente

---

## 📥 INPUT MANUAL (OBRIGATÓRIO)

Permitir input manual para:

* Valor da fatura
* Valor do kWh
* Investimento

---

## 📄 EXPORTAÇÃO

Gerar relatório em:

* PDF
* Layout limpo e profissional
* Estrutura idêntica ao modelo fornecido

---

## 🧱 ARQUITETURA SUGERIDA

* Frontend: React / Next.js
* Backend: Node.js ou Supabase
* Banco: PostgreSQL
* Integrações: APIs externas + Upload de fatura

---

## 🔄 PIPELINE DO SISTEMA

1. Receber dados (API + manual)
2. Processar cálculos
3. Gerar insights
4. Montar relatório
5. Exportar PDF

---

## 🚨 REGRAS IMPORTANTES

* NÃO permitir cálculos manuais fora do sistema
* TODOS os valores devem ser calculados automaticamente
* Evitar duplicidade de dados
* Garantir consistência entre API e fatura

---

## 🔥 RESULTADO ESPERADO

Um sistema capaz de:

* Processar +200 clientes automaticamente
* Gerar relatórios em lote
* Reduzir erro humano a zero
* Transformar dados em decisões

---

## ⚡ EXTRA (SE POSSÍVEL)

* Dashboard com gráficos
* Histórico mensal
* Alertas de baixa geração
* Comparação entre meses

---

## 📌 MISSÃO FINAL

Transformar dados de energia em:

→ inteligência
→ automação
→ escala
→ lucro

---

EXECUTE A IMPLEMENTAÇÃO COMPLETA.
