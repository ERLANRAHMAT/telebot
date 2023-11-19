const fetch = require('node-fetch');

const plugin = {
  commands: ['/tiktokslide'],
  tags: ['download'],
  init: async (bot, { buttonUrl, mess, api, apikey }) => {
    bot.onText(/^\/tiktokslide(?: (.+))?$/, async (msg, match) => {
      const chatId = msg.chat.id;
      const inputText = match[1];
      if (!inputText) {
        bot.sendMessage(chatId, 'Input Link! Example /tiktokslide https://vt.tiktok.com/ZSLx6qhwM', { reply_to_message_id: msg.message_id });
        return;
      }
      bot.sendMessage(chatId, mess.wait, { reply_to_message_id: msg.message_id });
      try {
        const apis = await fetch(api + '/api/download/ttslide?apikey=' + apikey + '&url=' + encodeURIComponent(inputText));
        const res = await apis.json();
        var {
          id, 
          region, 
          title,
          play
        } = res.result.data;

        const caption = `*Deskripsi:* ${title}\n*Region*: ${region}\n*ID:* ${id}\n*Audio:* ${play}`;

        const replyMarkup = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Script Bot', url: buttonUrl }],
              [{ text: 'Audio', url: play }],
            ],
          },
        };

        for (let i of res.result.data.images) {
          await sleep(6000); 
          await bot.sendPhoto(chatId, i, { caption: caption, parse_mode: 'Markdown', reply_to_message_id: msg.message_id, ...replyMarkup });
        }
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.', { reply_to_message_id: msg.message_id });
      }
    });
  },
};

module.exports = plugin;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}