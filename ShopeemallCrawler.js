const puppeteer = require('puppeteer');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'item',
});

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
};

var name = "nike Air force"; // Air Max 、dunk 、air force、Air jordan
var newName = name.replace(" ", "%20");
//  j為第幾頁 蝦皮從0 開始
// var j = 1;

async function main(newName, j) {
    //是否要背景執行 flase 
    const browser = await puppeteer.launch({ headless: false });
    // 叫puppeteer(操偶師)開啟一個瀏覽器介面
    const page = await browser.newPage();
    // 設定視窗大小   
    await page.setViewport({ width: 1920, height: 1080 });
    //去某某網站
    let shopurl = "https://shopee.tw/mall/search?keyword=" + newName + "&page=" + j;

    await page.goto(shopurl, { waitUntil: 'networkidle2' }); 
    // await page.goto(shopurl, {
    //     ignoreHTTPSErrors: true,
    //     timeout: 0,
    //     waitUntil: 'networkidle0',
    //     args: [
    //         '--no-sandbox',
    //         '--disable-setuid-sandbox',
    //         '--disable-dev-shm-usage',
    //         '--disable-accelerated-2d-canvas',
    //         '--disable-gpu'
    //     ]
    // });

    //


    await delay(20000);
    const elem = await page.$('div');
    const boundingBox = await elem.boundingBox();
    await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
    );
    await page.mouse.wheel({ deltaY: 1000 });
    var i = 0;
    while (i < 4) {

        await page.mouse.wheel({ deltaY: 1000 });
        await delay(5000);
        i++;
    };
    // await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});
    //#main > div > div.dYFPlI > div > div > div.sdzgsX > div > div.row.shopee-search-item-result__items > div:nth-child(1) > a

    var dataList = await page.evaluate(() => {
        let result = [];
        const $ = window.$;
        // let result__items = document.querySelector(" ");
        for (let i = 1; i <= 60; i++) {

            let url = "#main > div > div.dYFPlI > div > div > div.sdzgsX > div > div.row.shopee-search-item-result__items > div:nth-child(" + i + ") > a ";

            var newsItem = {

                url: document.querySelector(url).href,
                img: document.querySelector(url + "> div > div > div:nth-child(1) > div > img").src,
                name: document.querySelector(url + "> div > div > div.KMyn8J > div.dpiR4u > div.FDn--\\+ > div").innerText.replace(/"/g, ' ').replace(/[\u0800-\uFFFF]/g, ''),
                price: document.querySelector(url + "> div > div > div.KMyn8J > div.hpDKMN > div.vioxXd.rVLWG6 > span.ZEgDH9").innerText.replace(",", ""),
                sourceimg: "https://i.ibb.co/F7766Bz/image.png",
                source: "蝦皮商城",
                type : "",
                subtitle: ""
            };
            result.push(newsItem);


        }

        return result;
    });
    await browser.close();

    console.log(dataList);
    console.log(dataList.length);


    return dataList;

}

(async () => {
    //  j為第幾頁 蝦皮從0 開始到第?頁
    for (let j = 0; j < 1; j++) {

        const dataList = await main(newName, j);
        dataList.forEach((element) => {
            connection.query(`INSERT INTO sneakers (url,img,name,price,source) VALUES("${element.url}","${element.img}","${element.name}","${element.price}","${element.source}")`, function (error, results, fields) {
                if (error) throw error;
                console.log(results);
            });
        });
    }
    connection.end();
})();