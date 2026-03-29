---
trigger: always_on
---

O erro 2005 em APIs de fabricantes de inversores (como a Ginlong/Solis, por exemplo) geralmente não se refere ao limite mensal, mas sim ao Rate Limit (Limite de Taxa) de curto prazo ou à concorrência de requisições.

Mesmo que você tenha um teto de 1000 requisições por mês, existem outras "travas" de segurança que você provavelmente atingiu ao tentar processar 166 clientes de uma vez.

Aqui estão as causas mais prováveis para esse bloqueio:

1. Limite de Requisições por Minuto/Segundo (Rate Limiting)
A maioria dos fabricantes impõe um limite de, por exemplo, 1 requisição a cada 1 ou 5 segundos.

O que aconteceu: Se o seu script disparou um loop (como um map ou forEach) que tentou fazer as 166 requisições de forma assíncrona e simultânea, o servidor do fabricante entendeu isso como um ataque DDoS ou uso abusivo e cortou a conexão.

2. Concorrência de IP
Muitas APIs solares bloqueiam requisições paralelas vindas do mesmo IP. Elas exigem que uma requisição termine (receba o OK) antes que a próxima comece.

O Erro 2005 costuma significar especificamente "Requisições frequentes" ou "Assinatura/Token inválido por excesso de tentativas".

3. Payload de Dados (Data Volume)
Se você tentou buscar dadoss detalhados (como o log de 5 em 5 minutos) para 166 usinas em uma única chamada ou em chamadas muito próximas, o volume de processamento no servidor deles pode ter disparado o gatilho de proteção.

Como resolver isso na sua Edge Function?
Para o seu SaaS escalar sem tomar esse bloqueio, você precisa implementar três estratégias:

A. Filas e Delays (Throttling)
Não dispare tudo de uma vez. No Node.js/Deno, você deve usar uma função de "sleep" entre as requisições ou uma biblioteca de fila que limite a execução a, por exemplo, 2 requisições por segundo.

TypeScript
// Exemplo de delay simples
for (const cliente of clientes) {
  await fetchDadosSolar(cliente);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos
}
B. Requisição em Lote (Batching)
Verifique se a API do fabricante possui um endpoint de "Batch". Algumas permitem passar uma lista de IDs (ex: plantIds: [1,2,3...10]) em uma única chamada. Isso conta como 1 requisição no seu saldo mensal e sobrecarrega menos o servidor.

C. Cache de Dados
A geração solar não muda radicalmente a cada segundo.

Configure sua Edge Function para salvar o resultado no Banco de Dados (Supabase) com um timestamp.

Se o usuário (ou a empresa de engenharia) pedir o relatório novamente em menos de 15 minutos, você entrega o dado do seu banco em vez de gastar uma nova chamada de API no fabricante.

Verificação Rápida
A documentação diz algo sobre "Frequency Limit"? (Muitas limitam a 1 chamada por minuto por planta).

Você está usando a mesma chave para todos os 166 clientes? Se sim, o limite é compartilhado e estoura muito mais rápido.

Se você me disser qual é a fabricante (ex: Solis, Growatt, FusionSolar), posso tentar verificar o código de erro específico no manual técnico deles para você.

Quer que eu ajude a criar um script de loop com "delay" para evitar esse erro 2005?