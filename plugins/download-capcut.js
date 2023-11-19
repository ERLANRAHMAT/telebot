const fetch = require('node-fetch');

const plugin = {
  commands: ['/capcutdl'],
  tags: ['download'],
  init: async (bot, { buttonUrl, mess, api, apikey }) => {
    bot.onText(/^\/capcutdl(?: (.+))?$/, async (msg, match) => {
      const chatId = msg.chat.id;
      const inputText = match[1];
      if (!inputText) {
        bot.sendMessage(chatId, 'Input Link! Example /capcutdl https://www.capcut.com/template-detail/7273798219329441025?template_id=7273798219329441025&share_token=1ea9b68c-aa1b-4fc4-86c2-bf2b9136b6e0&enter_from=template_detail&region=ID&language=in&platform=copy_link&is_copy_link=1', { reply_to_message_id: msg.message_id });
        return;
      }
      bot.sendMessage(chatId, mess.wait, { reply_to_message_id: msg.message_id });
      try {
        const apis = await fetch(api + '/api/download/capcut?apikey=' + apikey + '&url=' + encodeURIComponent(inputText));
        const json = await apis.json();
        const { video_ori, title, digunakan, cover, author_profile } = json.result;

        const caption = `Title: ${title}\nDigunakan: ${digunakan}\nThumbnail: ${cover}\nProfile: ${author_profile}`;
        const replyMarkup = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Script Bot', url: buttonUrl }],
            ],
          },
        };

        bot.sendVideo(chatId, video_ori, { caption: caption, reply_to_message_id: msg.message_id, ...replyMarkup });
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.', { reply_to_message_id: msg.message_id });
      }
    });
  },
};

module.exports = plugin;