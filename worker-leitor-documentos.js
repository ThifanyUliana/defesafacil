/**
 * Defesa Fácil — Backend de leitura de documentos (Cloudflare Worker)
 * -------------------------------------------------------------------
 * Este worker recebe a foto do documento do app, chama a API da
 * Anthropic com a CHAVE DE VOCÊS (guardada como "secret", nunca exposta
 * no navegador) e devolve a explicação em JSON.
 *
 * COMO INSTALAR (uma vez só, leva uns 3 minutos):
 * 1. Crie uma chave de API em https://console.anthropic.com (Settings > API Keys).
 *    Isso tem custo por uso (é o que "paga" a leitura de cada documento).
 * 2. Vá em https://dash.cloudflare.com > Workers & Pages > Create > "Create Worker".
 *    Não precisa cartão de crédito no plano gratuito.
 * 3. Apague o código padrão e cole este arquivo inteiro.
 * 4. Vá em Settings > Variables > "Add secret":
 *      nome: ANTHROPIC_API_KEY
 *      valor: sua chave (começa com sk-ant-...)
 * 5. Clique em Deploy. Copie a URL gerada (algo como
 *    https://defesa-facil-ia.SEUUSUARIO.workers.dev).
 * 6. Cole essa URL no app (defesa-facil-app.html), na constante
 *    AI_BACKEND_URL, no lugar de "COLE_AQUI_A_URL_DO_WORKER".
 */

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    try {
      const { mediaType, base64, prompt } = await request.json();

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
                { type: 'text', text: prompt },
              ],
            },
          ],
        }),
      });

      const data = await anthropicRes.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
  },
};
