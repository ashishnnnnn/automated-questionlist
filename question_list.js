let puppeteer = require("puppeteer");
let fs = require("fs");

const PDFDocument = require('pdfkit');

let link = "https://www.geeksforgeeks.org/"

let inputt = process.argv.slice(2)[0];
let company = inputt.split(" ")[0]
let topictag = inputt.split(" ")[1]

//https://github.com/naman3112/Intelligent-referal-bot/blob/master/script.js

async function type(selector, input, tab) {
    for (let i = 0; i < input.length; i++) {
      let rando = Math.floor(Math.random() * 1000 + 200);
      await tab.type(selector, input[i], { delay: rando });
    }
}

async function letsWait() {
    let rando = Math.floor(Math.random() * 1700 + 200);
  
    return new Promise((res, rej) => {
      setTimeout(() => {
        res();
      }, rando);
    });
}

async function letsWaitLong() {
    let rando = Math.floor(Math.random() * 1700 + 2000);
  
    return new Promise((res, rej) => {
      setTimeout(() => {
        res();
      }, rando);
    });
}


console.log("Before");
(async function () {
    try {
        let browserInstance = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"]
        });
        let newPage = await browserInstance.newPage();
        await letsWait()
        await solveitt(newPage,company,topictag);
        let question_array = await bring_questions(newPage);
        fs.writeFileSync("questions_with_link.json", JSON.stringify(question_array));
        let path_of_json = "questions_with_link.json"
        convert_json_2_pdf(path_of_json);
        browserInstance.close();

    } catch (err) {
        console.log(err);
    }

})();

async function solveitt(newPage,company,topictag){
    await letsWait()
    await newPage.goto(link);
    await letsWaitLong()
    await autoScroll(newPage);
    await autoScroll(newPage);
    await letsWait()
    await newPage.waitForSelector(".footer-wrapper_links .footer-wrapper_links-list li a");
    function companytaglink(){
        let kk = document.querySelectorAll(".footer-wrapper_links .footer-wrapper_links-list li a")[11]
        return kk.getAttribute("href")
    }
    let companytag = await newPage.evaluate(companytaglink)
    await newPage.goto(companytag)
    await letsWaitLong()
    await newPage.waitForSelector('td [href="/company/Amazon/"]');
    await newPage.click('td [href="/company/Amazon/"]');
    await letsWaitLong()
    await letsWaitLong()
    await newPage.waitForSelector('[class="checkbox"] [value="Amazon"]');
    await newPage.click('[class="checkbox"] [value="Amazon"]')
    await newPage.waitForSelector('#collapse3 [name="company[]"]')
    await letsWaitLong();
    await letsWait()
    function companyctick(company){
        let elements = document.querySelectorAll('#collapse3 [name="company[]"]')
        for (let element of elements){
            company = company.trim()
            let temp = element.getAttribute("value")
            temp = temp.trim()
            if(temp==company){
                element.click()
                break;
            }
        }
    }
    await newPage.evaluate(companyctick,company);
    await letsWaitLong()
    await letsWait()
    await newPage.click('.cc-btn.cc-dismiss');
    await letsWaitLong();
    await letsWait()
    await newPage.waitForSelector('[href="#collapse4"]');
    await newPage.evaluate(()=>{
        kk = document.querySelectorAll('[href="#collapse4"]');
        kk[0].click();
    })
    await letsWaitLong()
    function topicktick(topictag){
        let elements = document.querySelectorAll('#collapse4 [name="category[]"]')
        for (let element of elements){
            topictag = topictag.trim()
            let temp = element.getAttribute("value")
            temp = temp.trim()
            if(temp==topictag){
                element.click()
                break;
            }
        }
    }
    await newPage.evaluate(topicktick,topictag);
    await letsWaitLong();
    await letsWaitLong();
    
    await autoScroll(newPage);
    await autoScroll(newPage);
}

// async function onetimescrool(newPage) {
//     await newPage.evaluate(async () => {
//       await new Promise((resolve, reject) => {
//           var scrollHeight = document.body.scrollHeight;
//           window.scrollBy(0, scrollHeight);
//           resolve();
//       });
//     });
//   }



//https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore#:~:text=use%20scrollBy%20(to%20incrementally%20scroll,the%20bottom%20of%20the%20page)
async function autoScroll(newPage) {
    await newPage.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
  
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }


async function bring_questions(newPage){
    function listlawo(){
        links = document.querySelectorAll('[style="position: absolute;top: 0;left: 0;height: 100%;width: 100%;z-index:1;pointer:cursor;"]')
        question_name = document.querySelectorAll('[style="display:block;font-size: 20px !important"]')
        ret = []
        for(let i=0;i<links.length;i++){
            lin = links[i].getAttribute("href")
            naam = question_name[i].innerText
            obj = {}
            obj["question_name"] = naam
            obj["link_of_question"] = lin
            ret.push(obj);
        }
        return ret
    }
    ret = await newPage.evaluate(listlawo);
    return ret
}

function convert_json_2_pdf(path_of_json){
    const doc = new PDFDocument();
    let content = fs.readFileSync(path_of_json);
    let json = JSON.parse(content);
    doc.pipe(fs.createWriteStream('questions_and_link.pdf'));
    for(let i=0;i<json.length;i++){
        obj = json[i]
        //console.log(obj)
        doc.text(i+1+"..")
        doc.text("\n")
        doc.text("question_name -> "+ obj.question_name)
        doc.text("\n")
        doc.text("link_of_question ->")
        doc.text(obj.link_of_question,{
            link: obj.link_of_question,
            underline: true
        })
        doc.text("\n")
        doc.text("\n")
    }
    doc.end();
}




