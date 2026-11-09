// ============================================================
//  Painel pessoal - proxy de clima para o iPad (iOS 9.3.5)
// ============================================================
//  POR QUE ISTO EXISTE?
//  O iOS 9.3.5 nao reconhece o certificado HTTPS do Open-Meteo,
//  entao o clima nunca carrega no Safari antigo quando a pagina
//  esta no GitHub Pages. Este Worker busca os dados no lugar do
//  iPad: o certificado do workers.dev e reconhecido pelo iOS 9.
//
//  COMO INSTALAR (gratis, uns 5 minutos, sem cartao):
//  1. Acesse https://dash.cloudflare.com e crie uma conta.
//  2. No menu, abra "Workers & Pages" > "Create" > "Create Worker".
//  3. De um nome, ex.: painel-clima  >  "Deploy".
//  4. Clique em "Edit code", apague o codigo de exemplo e cole
//     TODO o conteudo deste arquivo no lugar. Clique "Deploy".
//  5. A Cloudflare mostra o endereco do Worker, algo como:
//       https://painel-clima.SEUNOME.workers.dev
//  6. Abra o arquivo index.html, procure a linha
//       var WEATHER_PROXY = "";
//     e cole o endereco entre as aspas, terminando com "?url=":
//       var WEATHER_PROXY = "https://painel-clima.SEUNOME.workers.dev/?url=";
//  7. Faca commit e push. Recarregue a pagina no iPad.
//
//  Teste rapido: abra no navegador
//    https://painel-clima.SEUNOME.workers.dev/?url=https%3A%2F%2Fapi.open-meteo.com%2Fv1%2Fforecast%3Flatitude%3D-23.55%26longitude%3D-46.63%26current%3Dtemperature_2m
//  Se aparecer um texto JSON com a temperatura, esta funcionando.
// ============================================================

var ALLOWED_HOSTS = ["api.open-meteo.com", "geocoding-api.open-meteo.com"];

export default {
  async fetch(request) {
    var cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    var target = new URL(request.url).searchParams.get("url");
    if (!target) {
      return new Response("Faltou o parametro ?url=", { status: 400, headers: cors });
    }
    var parsed;
    try { parsed = new URL(target); } catch (e) {
      return new Response("URL invalida", { status: 400, headers: cors });
    }
    if (ALLOWED_HOSTS.indexOf(parsed.hostname) === -1) {
      return new Response("Host nao permitido", { status: 403, headers: cors });
    }
    var upstream = await fetch(parsed.toString(), {
      headers: { "User-Agent": "painel-pessoal-ipad" }
    });
    var body = await upstream.text();
    var headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=600"
    };
    for (var k in cors) headers[k] = cors[k];
    return new Response(body, { status: upstream.status, headers: headers });
  }
};
