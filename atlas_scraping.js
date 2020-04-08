const puppeteer = require('puppeteer');
const fs = require('fs-extra');

let cptCodes = [];
let procedures = [];
let total;
(async function main() {
  try {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://atlasbillingcompany.com/pricing/');
    await page.waitForSelector('#footer-info');

    await fs.writeFile('out.csv', 'Category\tProcedure\tCPT code\n');
    await fs.writeFile('weird.csv','Procedure\tCPT code\n');


    let sections = await page.$$('.price-row');
    let total = sections.length;
    let section;
    let button;

    for (let i = 0; i < total; i++)
    {
      section = sections[i];
      button = await section.$('a:first-child');
      const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
      await button.click({button: 'middle'});

      const page2 = await newPagePromise;

      await page2.bringToFront();
      await page2.waitForSelector('#et-main-area');

      if(await page2.$('.entry-content h6')){

        const cpt = await page2.$eval('.entry-content h6', (a) => {
          let code = a.innerText
            .replace('CPT Code: ','')
            .replace(/or/g,',')
            .replace('/', '')
            .replace(/\s/g, '')
            .replace(/\t/g, '')
          return code;
        });
        cptCodes.push(cpt);
      } else {
        const cpt = '';
        cptCodes.push(cpt);
      }

      if(await page2.$('.entry-title')){
        const procedure = await page2.$eval('.entry-title', (a) => {
          let proc = a.innerText.replace(/\t/g, '');
          return proc;
        });
        procedures.push(procedure);
      } else {
        const procedure = '';
        procedures.push(procedure);
      }


      await page.bringToFront();
      await page2.close();

      console.log(procedures[i],cptCodes[i], i, "of", total);
    }

    await browser.close()

    //print arrays to file
    for( var i = 0; i < total; i++){
      await fs.appendFile('out.csv', `${''}\t${procedures[i]}\t${cptCodes[i]}\n`);
    }


    //Creater new file with cpt codes longer than 6 charaters
    var tempCpt;
    var weird;
    //For every element in cptCodes
    for(let [index, element] of cptCodes.entries()){
      tempCpt = element.split(','); //create array of individual codes

      for (let i = 0; i < tempCpt.length; i++){
        if(tempCpt[i].length > 6){
          weird = true;
        }
      }

      if (weird){
        await fs.appendFile('weird.csv', `${procedures[index]}\t${element}\n`);
        weird = false;
      }
    }
    console.log('Done....')

  } catch(e){
    console.log('our error', e);
  }
})();
