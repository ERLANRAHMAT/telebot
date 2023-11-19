const fetch = require('node-fetch');

const plugin = {
  commands: ['/fbdl'],
  tags: ['download'],
  init: async (bot, { buttonUrl, mess, api, apikey }) => {
    bot.onText(/^\/fbdl(?: (.+))?$/, async (msg, match) => {
      const chatId = msg.chat.id;
      const inputText = match[1];
      if (!inputText) {
        bot.sendMessage(chatId, 'Input Link! Example /fbdl https://fb.watch/mcx9K6cb6t/?mibextid=8103lRmnirLUhozF ', { reply_to_message_id: msg.message_id });
        return;
      }
      bot.sendMessage(chatId, mess.wait, { reply_to_message_id: msg.message_id });
      try {
        const get = await fetch(api + '/api/download/fbdown?apikey=' + apikey + '&url=' + encodeURIComponent(inputText));
        const js = await get.json();
        const hdVideoUrl = js.result.HD;        
        const replyMarkup = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Script Bot', url: buttonUrl }],
            ],
          },
        };

        bot.sendVideo(chatId, hdVideoUrl, { caption: `Facebook Downloader`, parse_mode: 'Markdown', reply_to_message_id: msg.message_id, ...replyMarkup });
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.', { reply_to_message_id: msg.message_id });
      }
    });
  },
};

module.exports = plugin;