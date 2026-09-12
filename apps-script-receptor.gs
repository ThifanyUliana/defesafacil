/**
 * Defesa Fácil — Receptor de eventos do app
 * -------------------------------------------------------------
 * Este script recebe os eventos do app (acessos, documentos processados,
 * cliques em Ouvir/Libras) e grava uma linha na planilha "Log e Dashboard
 * de Acessos". O Dashboard (fórmulas nas colunas H/I) atualiza sozinho
 * porque lê direto das colunas A-F desta mesma aba.
 *
 * COMO INSTALAR (uma vez só):
 * 1. Abra a planilha "Defesa Fácil — Log e Dashboard de Acessos" no Drive.
 * 2. Menu Extensões > Apps Script.
 * 3. Apague o conteúdo padrão e cole este arquivo inteiro.
 * 4. Clique em Implantar > Nova implantação > tipo "App da Web".
 *    - Executar como: Eu (sua conta)
 *    - Quem pode acessar: Qualquer pessoa
 * 5. Copie a URL gerada (termina em /exec).
 * 6. Cole essa URL na constante SHEETS_WEBHOOK_URL no arquivo do app
 *    (defesa-facil-app.html), procure por "COLE_AQUI_A_URL_DO_APPS_SCRIPT".
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.evento || '',
    data.area_juridica || '',
    data.cidade || '',
    data.acessibilidade || '',
    data.observacao || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
