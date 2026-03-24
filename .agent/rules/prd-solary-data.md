---
trigger: always_on
---

PRD — MVP Solary Date (v2 — Operacional & UX Refinado)

1. Visão Geral

Sistema interno para automatizar a geração de relatórios mensais de desempenho de sistemas fotovoltaicos, com foco em:

- redução de esforço operacional  
- eliminação de cálculos manuais  
- prevenção de erro humano  
- padronização do processo mensal  

O sistema consolida dados de:

- faturas da concessionária (PDF)  
- plataformas de monitoramento solar (APsystems, Sungrow, GoodWe via API)  

E gera relatórios padronizados em PDF em lote, com validação assistida.

---

2. Problema

O processo atual é:

- manual  
- baseado em memória e atenção  
- sem método estruturado  
- sujeito a erro entre clientes  
- dependente de cálculos externos  

Riscos identificados:

- erro de associação entre clientes  
- erro de cálculo  
- retrabalho  
- baixa escala operacional  

---

3. Público

- Empresário do setor de energia solar  
- Equipe operacional interna  

Sem acesso do cliente final neste MVP.

---

4. Proposta de Valor

Gerar relatórios mensais com:

- automação do cruzamento de dados  
- cálculo automático confiável  
- validação orientada por sistema  
- redução drástica de esforço e erro  

---

5. Escopo

Inclui:

- Integração com APIs (APsystems, Sungrow, GoodWe)  
- Upload de faturas em lote (PDF)  
- Extração estruturada de dados  
- Associação automática por UC  
- Consolidação de dados  
- Motor de cálculo  
- Validação assistida por status  
- Edição controlada antes da geração  
- Geração de relatórios PDF  
- Geração em lote com feedback  
- Download em ZIP  

Não inclui:

- Envio automático de relatórios  
- Portal do cliente  
- Dashboard analítico  
- Multi-concessionária  
- OCR universal  
- Customização de layout  

---

6. Funcionalidades

6.1 Cadastro de clientes

Campos:

- Nome  
- Unidade consumidora (UC) (única)  
- Plataforma (APsystems / Sungrow / GoodWe)  
- System ID (identificador interno padronizado)  
- Investimento  
- Data de ativação  
- Perfil de consumo  

Regras:

- UC deve ser única no sistema  
- Cada cliente pertence a uma única plataforma  
- System ID deve ser validado contra API no momento do vínculo  

---

6.2 Integração com APIs

- Conexão por credenciais por plataforma  
- Sincronização de sistemas disponíveis  
- Associação assistida de System ID  

Estados possíveis:

- Conectado  
- Credencial inválida  
- Token expirado  
- API indisponível  

---

6.3 Upload de faturas

- Upload múltiplo (PDF)  
- Associação automática por UC  

Validações:

- Arquivo inválido  
- UC não encontrada  
- Duplicidade de fatura  
- Falha de leitura  

Parser extrai:

- valor da fatura  
- consumo  
- tarifa  
- iluminação pública  

Cada campo possui:

- valor extraído  
- nível de confiança  

---

6.4 Consolidação de dados

Cruzamento automático entre:

- cliente  
- geração (API)  
- consumo (fatura)  

Regras:

- ausência de dados gera estado de alerta  
- divergência entre fontes gera status “Divergente”  
- dados faltantes impedem status “Completo”  

---

6.5 Motor de cálculo

Cálculos automáticos:

- economia mensal  
- economia anual  
- economia acumulada  
- payback  
- ROI  
- redução %  
- impacto da iluminação pública  

Regras:

- não há cálculo manual externo  
- ausência de dados ativa fallback  
- todos os cálculos são recalculados após edição  

---

6.6 Fallback de dados

Quando dados de geração não estão disponíveis:

- sistema sugere uso de média histórica  
- usuário pode aceitar ou ajustar  
- fallback é marcado no sistema  

Impacto:

- relatório gerado com sinalização de estimativa  

---

6.7 Painel de validação

Status por cliente:

Completo:
- dados de API presentes  
- fatura válida  
- cálculos consistentes  

Divergente:
- diferença relevante entre consumo e geração  
- fallback aplicado  
- inconsistência detectada  

Incompleto:
- ausência de dados essenciais  
- falha de parser ou API  

Cada status exibe:

- motivo da classificação  
- ação recomendada  

---

6.8 Edição controlada

Permite:

- correção de dados da fatura  
- ajuste de valores extraídos  

Regras:

- toda edição gera log:
  - valor original  
  - valor editado  
  - usuário  
  - data  
- edição dispara recálculo automático  

---

6.9 Geração de relatório

- Template fixo  
- Texto dinâmico baseado em regras  
- Indicação de uso de fallback (se aplicável)  

Validações:

- apenas clientes “Completo” ou “Divergente” podem gerar  
- clientes “Incompleto” são bloqueados  

---

6.10 Geração em lote

- Seleção por competência  
- Processamento assíncrono  

Feedback:

- total  
- concluídos  
- falhas  

- Download em ZIP  

Suporte a:

- falha parcial  
- reprocessamento por cliente  

---

7. Fluxo Operacional

1. Selecionar competência  
2. Sincronizar APIs  
3. Upload de faturas  
4. Consolidação automática  
5. Painel de validação  
6. Correção (se necessário)  
7. Geração em lote  

---

8. Regras Gerais

- Operação baseada em competência mensal  
- Sistema é a fonte única de cálculo  
- Usuário não realiza cálculo manual  
- Associação por UC é obrigatória  
- Dados divergentes devem ser explicáveis  
- Toda ação crítica possui feedback  

---

9. Estados de Sistema

- vazio  
- sem integração  
- sem faturas  
- erro de API  
- erro de parser  
- divergência  
- processamento em andamento  
- sucesso parcial  
- sucesso completo  

---

10. Auditoria

Registro de:

- edições manuais  
- fallback aplicado  
- geração de relatório  
- falhas por cliente  

---

11. Métricas

- Tempo por lote  
- Relatórios gerados por mês  
- % de automação  
- Taxa de divergência  
- Taxa de fallback  
- Taxa de erro operacional  
- Tempo de onboarding  