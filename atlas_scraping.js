const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const writeStream = fs.createWriteStream('post.csv');

// Write Headers
writeStream.write(`Category¿ Procedure¿ CPT code \n`);

request('https://atlasbillingcompany.com/pricing/', (error, response, html) => {
  if (!error && response.statusCode == 200){

    const $ = cheerio.load(html);
    var category = '';

    $('.et_pb_section').each((i,el)=> {
      var procedure_search = $(el).find('.et_pb_text a').first().text().replace(/.$/,'');
      if (procedure_search != ''){
        var procedure = procedure_search;

        var href = $(el).find('.et_pb_text a').first().attr('href');
        request(`${href}`, (error, response, html) => {
          if(!error && response.statusCode == 200) {
            const $cpt = cheerio.load(html);

            var cpt = $cpt('.entry-content h6').text()
            .replace('CPT Code: ','')
            .replace(/or/g, ' -')
            .replace('/', '')
            .replace(/,/g, ' -');
          }
          else {
            //console.log(error)
          }

          writeStream.write(`${category}¿ ${procedure}¿ ${cpt} \n`);

        })

      }

    })

    console.log('Scraping Done...');

  }
})
