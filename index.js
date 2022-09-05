
const express = require('express')
const cherio = require('cherio');
const request = require('request');
const fs = require('fs');
const https = require('https')
const axios = require('axios');
let app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get("/", (req,res) => {
    res.send('users')
})

app.get("/downloadImages", async(req,res) => {
       try{
        let images = []
        var WriteStream  = fs.createWriteStream("ImagesLink.txt", "UTF-8");
        async function download(url){
            request(url, (err, resp, html)=>{
                if(!err && resp.statusCode == 200){
                    console.log("Request was success "); 
                    const $ = cherio.load(html);
                    $("img").each((index, image)=>{
                        var img = $(image).attr('src');
                        if(img.slice(0,4) == 'http'){
                            var Links = img
                        }else{
                            var baseUrl = url;
                            var Links = baseUrl + img;
                        }
                        WriteStream.write(Links);
                        WriteStream.write("\n");
                        if(!images.includes(Links)) images.push(Links)
                    });
                }else{
                    console.log(err);
                    return res.send({status : false, msg : err})
                }
                console.log(images.length)
                for(let i = 0; i < images.length; i++){
                    setTimeout(() => {
                        var fullUrl = images.shift()
                        let path = "./uploads/" + Date.now() + ".jpg"
                        let localPath = fs.createWriteStream(path);
                        let request = https.get(fullUrl, function(response){
                        console.log("downloaded successfully",i);
                        response.pipe(localPath)
                    })
                    },1000*i)
                }
            });
        } 
        (async () => {
        try {
            baseUrl = req.body.url
            let homePageLinks = await download(baseUrl)
            console.log(homePageLinks);
    } catch (e) { console.log(e); }

})();
    res.send({status : true, msg : "Downloaded successfully"})
       }catch(error){
        res.send({status : false, msg : error.message})
       }
    })

app.listen(3000, ()=>{
    console.log("Listening on port 3000")
})

// var baseUrl = 'https://www.growpital.com';

// (async () => {
    
//     try 
//     {
//         let homePageLinks = await getLinksFromURL(baseUrl)
//         console.log(homePageLinks);
//     } catch (e) { console.log(e); }

// })();

// let map1 = new Set()

// async function getLinksFromURL(url) {

//     try {
//         let urls;
//         let httpResponse = await axios.get(url);
//         let $ = cherio.load(httpResponse.data);
//         let linkObjects = $('a'); 
//         linkObjects.each((index, element) => {
//             if($(element).attr('href').slice(0,4) == 'http'){
//                 urls = $(element).attr('href')
//             }else{
//                 urls = baseUrl+$(element).attr('href')
//             }
//             map1.add(urls);
//         });
//       return [...map1];
//     } catch (error) {
//          console.log(error) 
//     }
// }

// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");
 
// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   page.on("response", async (response) => {
//     const url = response.url();
//     if (response.request().resourceType() === "image") {
//       response.buffer().then((file) => {
//         const fileName = url.split("/").pop();
//         const filePath = path.resolve(__dirname, fileName);
//         const writeStream = fs.createWriteStream(filePath);
//         writeStream.write(file);
//       });
//     }
//   });
//   await page.goto("https://www.bridgeport.edu/");
//   await browser.close();
// })();
