const puppeteer = require("puppeteer-extra");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const dotenv = require("dotenv");

dotenv.config();

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

(async () => {
  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: "2captcha",
        token: process.env.CAPTCHA_BREAKER_TOKEN, // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
      },
      visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
    })
  );

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(
    "https://www.empresafacil.pr.gov.br/acoes/abertura-de-empresa"
  );

  await page.waitForSelector("#botao-abertura-de-matriz-open");
  await page.click("#botao-abertura-de-matriz-open");

  await page.waitForSelector("#accountId");
  await page.type("#accountId", "108.824.699-08", { delay: 100 });

  await delay(1000);

  await page.click("#enter-account-id");

  await delay(15000);

  await page.solveRecaptchas();

  await page.waitForSelector("#password");
  await page.type("#password", "MorraG0verno!nc0mpetente", { delay: 100 });

  await page.click("#submit-button");

  await page.waitForSelector("#solicitacao_perfil_104306");
  await page.click("#solicitacao_perfil_104306");

  await page.click("#solicitacao_atualizaReceita_0");

  //selecionar curitiba
  await page.select("#solicitacao_empresas_0_endereco_municipio", "100141095");

  // Selecionar a opção "Sociedade Empresária Limitada" com o valor 10024
  await page.select("#solicitacao_empresas_0_natureza", "10024");

  await page.click("#botao-avancar");

  // await page.waitForSelector("#botao-balcao-unico");
  // await page.click("#botao-balcao-unico");

  //é contador
  await page.waitForSelector("#solicitacao_solicitante_isContador_0");
  await page.click("#solicitacao_solicitante_isContador_0");

  //não é instituição de crédito
  await page.click("#solicitacao_empresas_0_empresaSimplesCredito_1");
  //micro empresa
  await page.click("#solicitacao_empresas_0_porte_1");
  //O enquadramento/reenquadramento/desenquadramento da sua empresa será informado em cláusula contratual? - nao
  await page.click("#solicitacao_empresas_0_enquadramentoContratual_1");

  //avançar
  await page.click("#botao-avancar");
})();
