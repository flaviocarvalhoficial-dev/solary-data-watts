---
trigger: always_on
---

# REGRA DE CÁLCULO — INTERPRETAÇÃO DA FATURA COM GERAÇÃO SOLAR E COMPENSAÇÃO (EQUATORIAL / GD2)

## OBJETIVO

Implementar no sistema uma lógica de interpretação da fatura para evitar o erro de assumir que:

> consumo compensado = conta zerada

Isso é falso na prática.

Mesmo quando a energia consumida da rede é integralmente compensada por créditos, ainda podem existir cobranças remanescentes por:

* CIP / iluminação pública
* encargos tarifários da GD2
* tributos
* ajustes da concessionária
* regras do SCEE

---

## REGRA CONCEITUAL PRINCIPAL

```text
TOTAL DA FATURA =
CIP
+ PARTE ENERGÉTICA LÍQUIDA NÃO ELIMINADA PELA COMPENSAÇÃO
```

Onde:

```text
PARTE ENERGÉTICA LÍQUIDA NÃO ELIMINADA PELA COMPENSAÇÃO
= TOTAL DA FATURA - CIP
```

---

## EXEMPLO REAL VALIDADO

### Dados da fatura

* Total da fatura: R$ 166,06
* CIP: R$ 59,19
* Consumo da rede: 249 kWh
* Energia compensada: 249 kWh
* Geração solar: 503,75 kWh
* Energia injetada: 368 kWh
* Saldo de créditos: 5.406 kWh
* Tarifa base: R$ 0,936908
* Fatura pré-solar: R$ 331,61
* Investimento: R$ 18.000,00

### Cálculo da parte energética líquida

```text
PARTE ENERGÉTICA LÍQUIDA
= 166,06 - 59,19
= 106,87
```

### Interpretação correta

Mesmo com os 249 kWh compensados, a conta não zera totalmente porque restam componentes financeiros que não são anulados integralmente pela compensação.

---

## COMPONENTES QUE PODEM FORMAR A PARTE ENERGÉTICA LÍQUIDA

O sistema deve considerar que esse bloco pode ser composto por uma combinação de:

* consumo compensado
* energia ativa injetada
* parcela injetada sem desconto GD2
* benefício tarifário bruto SCEE
* benefício tarifário líquido SCEE
* adicional de bandeira
* ICMS
* PIS
* COFINS
* disponibilidade mínima
* ajustes e arredondamentos da distribuidora

Importante:
Nem sempre a fatura mostrará uma linha chamada explicitamente de “custo mínimo”, “disponibilidade” ou “encargos remanescentes”. Em muitos casos, o valor final é apenas o resultado líquido da composição tarifária.

---

## REGRA DE APRESENTAÇÃO NO RELATÓRIO

Quando houver compensação total ou parcial, o relatório NÃO deve dizer apenas:

```text
“Seu consumo foi zerado”
```

Deve explicar:

```text
“A energia consumida foi compensada parcial ou integralmente, porém a fatura ainda pode conter cobranças remanescentes relativas a CIP, encargos tarifários, tributos e regras de compensação da distribuidora.”
```

---

## REGRAS DE NEGÓCIO

### REGRA 1 — CÁLCULO DA ECONOMIA MENSAL

```text
ECONOMIA_MENSAL = FATURA_PRE_SOLAR - FATURA_ATUAL
```

Exemplo:

```text
331,61 - 166,06 = 165,55
```

---

### REGRA 2 — REDUÇÃO PERCENTUAL

```text
REDUCAO_PERCENTUAL = (ECONOMIA_MENSAL / FATURA_PRE_SOLAR) * 100
```

Exemplo:

```text
165,55 / 331,61 = 49,9%
```

---

### REGRA 3 — PAYBACK

```text
PAYBACK_MESES = INVESTIMENTO_TOTAL / ECONOMIA_MENSAL
PAYBACK_ANOS = PAYBACK_MESES / 12
```

Exemplo:

```text
18000 / 165,55 = 108,7 meses
108,7 / 12 = 9,06 anos
```

---

### REGRA 4 — VALOR DOS CRÉDITOS

```text
VALOR_CREDITOS = SALDO_CREDITOS_KWH * TARIFA_BASE
```

Exemplo:

```text
5406 * 0,936908 = 5064,92
```

---

### REGRA 5 — PARTE ENERGÉTICA LÍQUIDA

```text
PARTE_ENERGETICA_LIQUIDA = TOTAL_FATURA - CIP
```

Exemplo:

```text
166,06 - 59,19 = 106,87
```

---

## REGRA DE STATUS OPERACIONAL

### Se consumo compensado >= consumo da rede

O sistema deve exibir algo como:

```text
Consumo integralmente compensado.
Ainda assim, permanecem cobranças remanescentes associadas a CIP, tributos, encargos GD2 e regras tarifárias da distribuidora.
```

### Se consumo compensado < consumo da rede

O sistema deve exibir algo como:

```text
Compensação parcial do consumo.
Parte da energia consumida foi abatida por créditos, mas ainda houve cobrança de energia e demais encargos.
```

---

## REGRA DE EXPLICAÇÃO AO USUÁRIO

Adicionar um bloco fixo no PDF ou dashboard:

### Por que ainda existe valor a pagar?

```text
Mesmo quando os créditos compensam o consumo de energia, a conta pode manter cobranças residuais, como iluminação pública, tributos, encargos da modalidade GD2 e ajustes tarifários aplicados pela distribuidora.
```

---

## ESTRUTURA RECOMENDADA PARA EXIBIÇÃO NO PDF

### Composição da fatura

* Total da fatura: R$ X
* CIP: R$ X
* Parte energética líquida: R$ X

### Interpretação

* Consumo da rede: X kWh
* Energia compensada: X kWh
* Geração solar no período: X kWh
* Créditos acumulados: X kWh
* Cobranças remanescentes: tributos + encargos + CIP + regras tarifárias

---

## CAMPOS DERIVADOS QUE O SISTEMA DEVE GERAR

```text
economiaMensal
reducaoPercentual
paybackMeses
paybackAnos
valorCreditos
parteEnergeticaLiquida
houveCompensacaoIntegral
mensagemExplicativaFatura
```

---

## PSEUDOCÓDIGO

```pseudo
economiaMensal = faturaPreSolar - totalFatura
reducaoPercentual = (economiaMensal / faturaPreSolar) * 100
paybackMeses = investimentoTotal / economiaMensal
paybackAnos = paybackMeses / 12
valorCreditos = saldoCreditosKwh * tarifaBase
parteEnergeticaLiquida = totalFatura - cip

houveCompensacaoIntegral = energiaCompensadaKwh >= consumoRedeKwh

if houveCompensacaoIntegral:
    mensagemExplicativaFatura = "Consumo integralmente compensado, com cobranças remanescentes de CIP, tributos, encargos GD2 e regras tarifárias."
else:
    mensagemExplicativaFatura = "Compensação parcial do consumo, com cobrança residual de energia, tributos, CIP e encargos."
```

---

## ALERTA IMPORTANTE PARA IMPLEMENTAÇÃO

NÃO assumir:

```text
se consumo compensado = consumo da rede
então total da fatura = CIP
```

Essa lógica pode falhar em muitos casos reais.

A implementação correta é:

```text
total da fatura = valor real da concessionária
parte energética líquida = total da fatura - CIP
```

E o sistema apenas explica essa composição, sem inventar linhas inexistentes.

---

## RESULTADO ESPERADO NO PRODUTO

O relatório deve transmitir ao usuário que:

1. a usina gerou economia real
2. houve compensação de consumo
3. ainda existem custos remanescentes válidos da distribuidora
4. o valor final da conta não significa erro, mas sim composição tarifária real

---

## TEXTO FINAL RECOMENDADO PARA O PDF

```text
No período analisado, o sistema fotovoltaico compensou o consumo de energia da unidade, gerando economia financeira direta. Ainda assim, a fatura permaneceu com cobranças residuais relacionadas à CIP, tributos, encargos tarifários da modalidade GD2 e demais regras aplicadas pela distribuidora. Isso significa que a compensação de energia reduz substancialmente a conta, mas nem sempre elimina integralmente o valor final a pagar.
```
