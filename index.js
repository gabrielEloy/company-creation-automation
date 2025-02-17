const puppeteer = require("puppeteer-extra");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const dotenv = require("dotenv");

dotenv.config();

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}


const partners = [
  {
    cpf: "108.824.699-08",
    name: 'Gabriel Eloy'
  }
]


const getCompanyName = (partners) => {
  let companyName = '';
  if(partners.length === 1){
    companyName =  partners[0].name
  } else {
    companyName = partners.reduce((acc, partner, idx) => {
      const getSurName = (name) => name.split(' ')[name.split(' ').length - 1];
    
      return idx === 0
        ? getSurName(partner.name)
        : acc + ` E ${getSurName(partner.name)}`;
    }, '');
  }


  // return `${companyName.toUpperCase()} SERVIÇOS DE TECNOLOGIA`
  return `${companyName.toUpperCase()} TECNOLOGIA`
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

  await delay(8000);

  await page.solveRecaptchas();

  await page.waitForSelector("#password");
  await page.type("#password", "MorraG0verno!nc0mpetente", { delay: 100 });
  await page.click("#submit-button");

  await page.waitForNavigation();

  //Identificação

  //Entidade de registro - junta comercial
  await page.waitForSelector("#solicitacao_perfil_104306");
  await page.click("#solicitacao_perfil_104306");

  //status atualização receita - não
  await page.waitForSelector("#solicitacao_atualizaReceita_1");
  await page.click("#solicitacao_atualizaReceita_1");

  //selecionar curitiba
  await page.waitForSelector("#solicitacao_empresas_0_endereco_municipio");
  await page.waitForFunction(
    () => document.querySelector("#solicitacao_empresas_0_natureza").options.length > 5
  );
  await page.select("#solicitacao_empresas_0_endereco_municipio", "100141095");

  // Selecionar a opção "Sociedade Empresária Limitada" com o valor 10024
  await page.waitForSelector("#solicitacao_empresas_0_natureza");
  await page.waitForFunction(
    () => document.querySelector("#solicitacao_empresas_0_natureza").options.length > 5
  );
  await page.select("#solicitacao_empresas_0_natureza", "10024");

  await page.waitForSelector("#botao-avancar");
  await page.click("#botao-avancar");

  //Dados da empresa

  await page.waitForNavigation();

  const botaoBalcaoUnicoExists = (await page.$("#botao-balcao-unico")) !== null;

  //Fechar um modal irritante
  if (botaoBalcaoUnicoExists) {
    await page.click("#botao-balcao-unico");
  }

  //Selecionar que sou contador :p
  await page.waitForSelector("#solicitacao_solicitante_isContador_0");
  await page.click("#solicitacao_solicitante_isContador_0"); // Opção sim para contador
  
  //Selecionar que não estou abrindo uma instituição de crédito
  await page.waitForSelector("#solicitacao_empresas_0_empresaSimplesCredito_1");
  await page.click("#solicitacao_empresas_0_empresaSimplesCredito_1");
  //Selecionar enquadramento da empresa - microempresa
  await page.waitForSelector("#solicitacao_empresas_0_porte_1");
  await page.click("#solicitacao_empresas_0_porte_1");
  //Selecionar que o enquadramento SERÁ informado em clausula contratual
  await page.waitForSelector("#solicitacao_empresas_0_enquadramentoContratual_0");
  await page.click("#solicitacao_empresas_0_enquadramentoContratual_0");
  
  //Avançar
  await page.waitForSelector("#botao-avancar");
  await delay(5000);
  await page.click("#botao-avancar");
  
  console.log('antes do wait')
  console.log('depois do wait')
  
  //Quadro Societário
  
  const partner = partners[0]
  console.log('entramos aqui. To on!')
  console.log({partner});
  await page.waitForSelector('#solicitacao_empresas_0_socios_0_pessoa_cpfCnpj');
  await page.type("#solicitacao_empresas_0_socios_0_pessoa_cpfCnpj", partner.cpf, { delay: 100 });

  // Remover o foco do campo CPF/CNPJ
  await page.evaluate(() => {
    document.querySelector("#solicitacao_empresas_0_socios_0_pessoa_cpfCnpj").blur();
  });
  
  // Retornando o valor do campo nome diretamente
  let nome = await page.evaluate(() => document.querySelector("#solicitacao_empresas_0_socios_0_pessoa_nome").value);

  while(!nome){
    await delay(2000);
    console.log('tentando pegar o nome');
    nome = await page.evaluate(() => document.querySelector("#solicitacao_empresas_0_socios_0_pessoa_nome").value);
  }

  console.log('peguei o nome');
  
  //Adicionar sócio
  await page.waitForSelector("#add-partner");
  await page.click("#add-partner");


  //Deseja utilizar o CNPJ da empresa como nome empresarial, conforme a resolução 61 da CGSIM? - NAO
  await page.waitForSelector("#solicitacao_empresas_0_isUtilizaCnpjNome_1");
  await page.click("#solicitacao_empresas_0_isUtilizaCnpjNome_1");


  //Como será definida a razão social pretendida? - Firma
  await page.waitForSelector("#solicitacao_empresas_0_tipoRazaoSocial_0");
  await page.click("#solicitacao_empresas_0_tipoRazaoSocial_0");
  
  // ❌ daqui pra baixo não funciona 
  if(partners.length === 1){
    await page.waitForSelector("#opcao-ltda-1");
    const parentElement = await page.$('#opcao-ltda-1');
    const childElements = await page.evaluate(el => Array.from(el.parentElement.children), parentElement);

    for (const child of childElements) {
      const selectElement = await page.evaluateHandle(el => el.querySelector('select'), child);
      if (selectElement) {
      const options = await selectElement.evaluate(el => el.options);
      const lastOptionValue = options[options.length - 1].value;
      await selectElement.select(lastOptionValue);
      }
    }


    const fields = await page.evaluate(el => el.parentElement.children, parentElement);
    console.log({fields})

    // for(let field of fields){
    //   const childrenCount = await page.evaluate(el => el.children.length, field);
    //   await field.select(String(childrenCount));
    // }

    // await page.waitForSelector('#input-ltda');
    // await page.type("#input-ltda", getCompanyName(partners), { delay: 100 });

    // const companyInput = await page.$('#input-ltda');
    // const button = await page.evaluateHandle(el => el.parentElement.parentElement.querySelector('button'), companyInput);

    // await button.click();
  }
})();
