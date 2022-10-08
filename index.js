const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');



async function readQr() {
    url1 = "https://noticias.uol.com.br/loterias/loteria-federal/"

    return await new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({ headless: true, timeout: 60000, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            // Configure the navigation timeout
            await page.setDefaultNavigationTimeout(0);
            
            await page.goto(url1);
            const tabela = await page.evaluate(
                () => Array.from(
                  document.querySelectorAll('tbody > tr'),
                  row => Array.from(row.querySelectorAll('th, td'), cell => cell.innerText)
                )
              );
            var concurso = await page.evaluate(() => Array.from(document.getElementsByClassName('lottery-info'), e => e.innerText));
            consurso = await concurso[0].split(" ")
            
             var arraySorteio = []
             for (let index = 0; index < tabela.length; index++) {
                arraySorteio.push(tabela[index][1])
             }


            let valor_sorteio = []
            for (let index = 0; index < 5; index++) {
                const premio = arraySorteio[index];
                if (index == 0) {
                    valor_sorteio.push(premio.substr(-2))
                }else{
                    valor_sorteio.push(premio.substr(-1))
                }
                
            }
            valor_sorteio = valor_sorteio.join('');

           

            var resultado = {
                "concurso": consurso[1],
                "data_sorteio": consurso[4],
                "valor_sorteio":valor_sorteio
            }

            resolve(resultado)
            await page.close()
            await browser.close();

        } catch (e) {
            console.log(e)
            reject("error")
        }
    });


}

var app = express();
app.use((req, res, next) => {
    //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
    //Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});
app.use(bodyParser.json());




app.get('/loteria', async function (req, res) {
    await readQr().then(x => {
        res.json(x)
    }).catch(x => {
        res.json(x)
    })
});



var server = app.listen(5050, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});
