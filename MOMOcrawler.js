//引入puppeteer模組
const puppeteer = require('puppeteer');
//引入MySQL模組
const mysql = require('mysql');
//設定連線資訊
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'item',
});
//定義搜尋關鍵字
const name = "nike air force"; 
//將關鍵字的空格做處理
const newName = name.replace(" ", "%20");

//定義一個delay函數，用於設置延遲時間。
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
};
//操作puppeteer
async function main(newName, i) {
    const browser = await puppeteer.launch({ headless: false });
    //開啟瀏覽器
    const page = await browser.newPage();
    //設定網頁長寬
    await page.setViewport({ width: 1920, height: 1080 });
    //宣告要前往的URL
    const shopurl = "https://www.momoshop.com.tw/search/searchShop.jsp?keyword=" + newName + "&searchType=1&curPage=" + i + "&_isFuzzy=0&showType=chessboardType";
    //讓瀏覽器前往設定的網址
    await page.goto(shopurl, { waitUntil: 'networkidle2' });
    //設定延遲
    await delay(1000);
 
    const elem = await page.$('div');
    const boundingBox = await elem.boundingBox();
    await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
    );

    await page.mouse.wheel({ deltaY: 1000 });
    var i = 0;
    while (i < 3) {

        await page.mouse.wheel({ deltaY: 200 });
        await delay(1000);
        i++;
    };

    var dataList = await page.evaluate(() => {
        let result = [];
       

        for (let index = 1; index <= 30; index++) {

            let path = "#BodyBase > div.bt_2_layout.searchbox.searchListArea.selectedtop > div.searchPrdListArea.bookList > div.listArea > ul > li:nth-child(" + index + ")";
            var newItem = {
                url: document.querySelector(path + " > a").href,
                img: document.querySelector(path + " > a > div.prdImgWrap.prdListSwiper.swiper-container.manyPics.swiper-container-initialized.swiper-container-horizontal > div.swiper-wrapper > div.swiper-slide.swiper-slide-active > img").src,
                name: document.querySelector(path + " > a > div.prdInfoWrap > div.prdNameTitle > h3").innerText,
                price: document.querySelector(path + " > a > div.prdInfoWrap > p.money > span.price > b").innerText.replace(",", ""),
                source: "momo購物網",
                sourceimg:"https://i.ibb.co/NpC2tpx/momoshop.png",
                subtitle: "",
                type:""
            };
            result.push(newItem);
        };

        return result;
    });

    await delay(3000);


    await browser.close();

    console.log(dataList);
    console.log(dataList.length);

    return dataList; // resolve the Promise with the scraped data
}
// i 為第幾頁 momo從1開始
// const i = 1;
(async () => {
    for(let i = 1;i<3;i++){

        const dataList = await main(newName, i);
        dataList.forEach((element) => {
            connection.query(`INSERT INTO sneakers (url,img,name,price,source,sourceimg,subtitle,type) VALUES("${element.url}","${element.img}","${element.name}","${element.price}","${element.source}","${element.sourceimg}","${element.subtitle}","${element.type}")`, function (error, results, fields) {

                if (error) throw error;
                // console.log('資料庫新增成功');
                console.log(results);
            }); 
        });
    }
    
    connection.end();
})();
