const fetch = require('node-fetch');

const plugin = {
  commands: ['/ai'],
  tags: ['openai'],
  init: async (bot, { buttonUrl, mess, api, apikey }) => {
    bot.onText(/^\/ai(?: (.+))?$/, async (msg, match) => {
      const chatId = msg.chat.id;
      const inputText = match[1];
      if (!inputText) {
        bot.sendMessage(chatId, 'Input Query! Example /ai hai', { reply_to_message_id: msg.message_id });
        return;
      }
      bot.sendMessage(chatId, mess.wait, { reply_to_message_id: msg.message_id });
      try {
        const response = await fetch(api + '/api/search/openai-chat?apikey=' + apikey + '&text=' + encodeURIComponent(inputText));
        const responseMessage = await response.json();

        const replyMarkup = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Script Bot', url: buttonUrl }],
            ],
          },
        };

       bot.sendPhoto(chatId, 'https://telegra.ph/file/7a385897829927b981dfa.jpg', { caption: responseMessage.message, parse_mode: 'Markdown', reply_to_message_id: msg.message_id, ...replyMarkup });                                
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.',  { reply_to_message_id: msg.message_id });
      }
    });
  },
};

module.exports = plugin;