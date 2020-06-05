const request = require('request');
const request_promise_native = require('request-promise-native');
const RateLimiter = require('request-rate-limiter');
const cheerio = require('cheerio');
const fs = require('fs');

const card_count = 658; // Total # of cards
const page_count = 8; // # of cards per request
const limiter = new RateLimiter({rate: 60, interval: 60, backoffCode: 508, backoffTime: 10, maxWaitingTime: 1000000});
let cards = []; 
let promises = [];

function parse(error, response, body) {
  if (error) {
    console.log('Error: ' + error );
    //console.log('Re-attemping url: ' + response.url);
    //const card_request = { method: 'GET', url: response.url};
    //promises.push(limiter.request(card_request, parse));
    throw new Error(error);
  }
//  console.log('Received page: ' + response.url);
//  console.log(response.body);
  const $ = cheerio.load(body);//response.body);
  $('img[src="https://dragoborne.com/data/editor/card/ACT@.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[ACT]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/AUTO@.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[AUTO]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/CONT@.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[CONT]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/STAND@.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[STAND]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/REST@.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[REST]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/DS@.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dragoshield]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/DC@C.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dragocross]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/DC@Y.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dragocross]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/DC@G.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dragocross]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/DC@U.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dragocross]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/DC@B.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dragocross]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/DC@R.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dragocross]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/FB@.png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Fort Burst]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[1].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[1].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[1].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[1].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[1].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[1-2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[1-2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[1-2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[1-2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[1-2].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-2]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[1-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[1-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[1-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[1-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[1-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[1-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[1-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[1-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[1-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[1-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[1-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[1-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[1-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[1-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[1-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[1-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[1-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[1-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[1-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[1-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 1-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[2-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[2-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[2-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[2-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-3]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[2-3].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-3]<p/>'))});   
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[2-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[2-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[2-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[2-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[2-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[2-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[2-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[2-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[2-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[2-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[2-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[2-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[2-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[2-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[2-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 2-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[3-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[3-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[3-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[3-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-4]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[3-4].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-4]<p/>'))});   
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[3-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[3-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[3-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[3-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[3-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[3-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[3-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[3-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[3-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[3-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 3-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[4-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[4-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[4-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[4-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[4-5].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-5]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[4-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[4-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[4-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[4-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[4-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 4-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/YELLOW@[5-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/GREEN@[5-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLUE@[5-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/BLACK@[5-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5-6]<p/>'))});
  $('img[src="https://dragoborne.com/data/editor/card/RED@[5-6].png"]').each((i,elem)=>{$(elem).replaceWith($('<p>[Dice 5-6]<p/>'))});
  let card = {name:"", id:"", set:"", number:"", type:"", color:"", flavor:"", rarity:"", artist:"", cost:0, trait:"", ability:"", attack:0, endurance:0, image_url:""};
//  console.log($.html());
//  console.log('');
//  console.log('----------------------------------------------------');
//  console.log('');
  const card_data = $('tr', '#card_info').toArray();
//  console.log('Card rows: ' + card_data.length);
//  console.log('Card id: ' + $(card_data[13]));
  card.id = $(card_data[13]).find('td').last().text().trim();
  card.set = card.id.substring(3, card.id.indexOf('/'));
  card.number = card.id.substring(card.id.indexOf('/') + 1);
  card.name = $(card_data[0]).children().last().text().trim();
  card.cost = $(card_data[8]).children().last().text().trim();
  const nation = $(card_data[3]).children().last().text().trim();
  if (nation.includes('Logres'))
    card.color = 'Y';
  else if (nation.includes('Tir'))
    card.color = 'G';
  else if (nation.includes('Olous'))
    card.color = 'U';
  else if (nation.includes('Niflheim'))
    card.color = 'B';
  else if (nation.includes('Tauris'))
    card.color = 'R';
  card.type = $(card_data[1]).children().last().text().trim();
  card.trait = $(card_data[2]).children().last().text().trim();
  card.attack = $(card_data[9]).children().last().text().trim();
  card.endurance = $(card_data[10]).children().last().text().trim();
  card.ability = $(card_data[5]).text().trim();
  card.flavor = $(card_data[7]).text().trim();
  const rarity = $(card_data[11]).children().last().text().trim();
  if (rarity.includes('Secret'))
    card.rarity = 'SR';
  else if (rarity.includes('Double'))
    card.rarity = 'RR';
  else if (rarity.includes('Rare'))
    card.rarity = 'R';
  else if (rarity.includes('Uncommon'))
    card.rarity = 'U';
  else if (rarity.includes('Common'))
    card.rarity = 'C';
  card.artist = $(card_data[12]).children().last().text().trim();
  card.image_url = ('https://dragoborne.com/' + $('.text-center').find('img').attr('src').substring(11)).replace(' ', '%20');
  cards.push(card);
}

console.log('Starting...');
for (let current_offset = 0; current_offset < card_count; current_offset+= page_count) {
  const dragoborne_request = { method: 'POST',
    url: 'https://dragoborne.com/card/card/searchcardnow',
    headers: { 'Cache-Control': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded' },
    form: { 'condi[name]': '1',
      'condi[type_id]': '1',
      'condi[trait_id]': '1',
      'condi[nation_id]': '1',
      'condi[product_id]': '1',
      'condi[ability]': '1',
      'condi[flavour]': '1',
      'condi[cost]': '1',
      'condi[attack]': '1',
      'condi[endurance]': '1',
      'condi[rarity]': '1',
      'condi[artist]': '1',
      name: '',
      'type_id[]': '',
      'trait_id[]': '',
      'nation_id[]': '',
      artist: '',
      sorting_rule: '',
      offset: current_offset
    }
  };
  console.log('Sending db request for offset: ' + current_offset);
  promises.push(request_promise_native(dragoborne_request, (error, response, body) => {
    if (error) {
      console.log('Could not get response for offset: ' + current_offset);
      // throw new Error(error);
    }
    else {
      console.log('Received response. Parsing...');
      const $ = cheerio.load(JSON.parse(body).card_content);
      $('.card-link').each((i, elem) => {
        const card_url = $(elem).attr('href');
function send() {
  console.log('Sending card request: ' + card_url);
  promises.push(limiter.request(function(err, backoff) { if (err) { console.log('FRAMEWORK ERROR: ' + err); send(); } else {
    request({url: card_url}, function(card_err, card_response, card_body) {
      if (card_err || !card_response || card_response.statusCode === 508 || !card_body) {
        // we have to back off. this callback will be called again as soon as the remote endpoint
        // should accept requests again. no need to queue your callback another time on the limiter.
        console.log('Request rejected. Going to resend: ' + card_url);
        backoff();
      }
      else {
        // the request should be good
        console.log('Received page. Going to parse: ' + card_url);
        parse(card_err, card_response, card_body);
      }
    });
  }}));
}
        send();  
//      promises.push(limiter.request({method: 'GET', url: card_url}, parse));
      });
    }
  }));
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function sortAndWriteAllCards() {
  cards = sortByKey(cards, 'id');
  fs.writeFile('AllCards.json', JSON.stringify(cards), (error) => {
    if (!error) {
      console.log('AllCards.json updated');
    } else {
      console.log('Error while writing AllCards.json');
    }
  });
}

// Wait for all cards to be found, then write AllCards.json
setTimeout(() => {
  Promise.all(promises).then(
    () => {
      console.log('All cards received. Sorting and writing all cards...');
      sortAndWriteAllCards();
    }, (err) => {
      console.log('Error while waiting for calls to return. Sorting and writing anyways...');
      sortAndWriteAllCards();
  })
}, 600000);// 10 min delay before waiting
