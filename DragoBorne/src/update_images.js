const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

let rawdata = fs.readFileSync('AllCards.json');
let allCards = JSON.parse(rawdata);
let img_srcs = [];

async function fetchData(url){
    let response = await axios(url).catch((err) => console.log("Error while fetching from " + url));
    if(response.status !== 200){
        console.log("Error while fetching from " + url);
        return;
    }
    return response;
}

const getHtmlPages = async () => {
  const sourceUrl = 'https://dragoborne.fandom.com/wiki/';

  for (card of allCards) {
    const sanitizedName = card["name"].split(' ').join('_');
    console.log("Getting card " + sanitizedName + "...");
    const url = sourceUrl + sanitizedName;
    let res = await fetchData(url);
    if (res) {
      const html = res.data;
      card["html"] = html;
    }
    else {
      console.log("Error while fetching from " + url);
    }
  }
}

function storeHtmlPages() {
  console.log("Got cards. Storing...");
  for (card of allCards) {
    const sanitizedName = card["name"].replace(/[^a-z0-9]/gi, '_').toLowerCase();
    fs.writeFile("pages/" + sanitizedName + ".html", card["html"], function(err, result) {
     if(err) console.log('error', err);
   });
  }
  console.log("Html pages cached!");
}

function parseImgSrcs (body, callback) {
  const $ = cheerio.load(body, {xmlMode: true});
  const imgs = $('img');
  $(imgs).each(function(i, elem) {
    let url = $(elem).attr('src');
    let ext = url.indexOf(".png");
    if (ext > 0)
      url = url.substr(0, ext + 4);
    ext = url.indexOf(".jpg");
    if (ext > 0)
      url = url.substr(0, ext + 4);
    ext = url.indexOf(".jpeg");
    if (ext > 0)
      url = url.substr(0, ext + 5);
    if (url.startsWith("https://vignette.wikia.nocookie.net/dragoborne/images") && !img_srcs.includes(url))
      img_srcs.push(url);
  });
  callback();
};

function updateImages() {
  console.log("Starting update...");
  for (card of allCards) {
    let image_url = "";
    const sanitizedName = card["name"].replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const htmlFile = fs.readFileSync("pages/" + sanitizedName + ".html");
    parseImgSrcs(htmlFile, function() {
      img_srcs.forEach(url => {
        //console.log(url);
        let filename = url.toLowerCase();
        let end = url.lastIndexOf('.');
        if (end > 0 && end < url.length)
          filename = filename.substr(0, end);
        let start = filename.lastIndexOf('/') + 1;
        if (start > 0 && start < end)
          filename = filename.substr(start, end);
        if (sanitizedName.includes(filename) || (url.includes(card["set"]) && url.includes(card["number"]))
          || (url.includes(card["set"]) && url.includes(card["name"].replace(' ', '_')))
          || (card["id"] == "DB-TD04/016" && url.includes("https://vignette.wikia.nocookie.net/dragoborne/images/9/92/DB-TD-016"))) {
          if (image_url)
            console.log("Found more than one match for " + card["id"]);
          image_url = url;
        }
      });
      if (image_url)
        card["image_url"] = image_url;
      else 
        console.log("Failed to get image for " + card["id"]);
    });
  }
  console.log("Updated image_url for allCards; writing to file...");
  fs.writeFile("AllCards.json2", JSON.stringify(allCards), function(err, result) { if(err) console.log('error', err); } );
  console.log("Completed update!");
}

//getHtmlPages().then(storeHtmlPages);
updateImages();