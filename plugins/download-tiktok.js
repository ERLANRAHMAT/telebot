const fetch = require('node-fetch');

const plugin = {
  commands: ['/tiktok'],
  tags: ['download'],
  init: async (bot, { buttonUrl, mess, api, apikey }) => {
    bot.onText(/^\/tiktok(?: (.+))?$/, async (msg, match) => {
      const chatId = msg.chat.id;
      const inputText = match[1];
      if (!inputText) {
        bot.sendMessage(chatId, 'Input Link! Example /tiktok https://vm.tiktok.com/ZGJAmhSrp/ ', { reply_to_message_id: msg.message_id });
        return;
      }
      bot.sendMessage(chatId, mess.wait, { reply_to_message_id: msg.message_id });
      try {
        const apis = await fetch(api + '/api/download/tiktok?apikey=' + apikey + '&url=' + encodeURIComponent(inputText));
        const res = await apis.json();
        var {
          title, 
          duration, 
          total_share,
          total_download,
          total_play,
          total_comment
        } = res.result.info_video
        const { 
          nowm,
          wm, 
          audio 
        } = res.result.url
        const caption = `*Deskripsi:* *${title}*\n*Durasi:* ${duration}\n*Total Share:* ${total_share}\n*Total Download:* ${total_download}\n*Total Play:* ${total_play}\n*Total Komentar:* ${total_comment}\n*Audio:* [Audio](${audio})`;
        const replyMarkup = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Script Bot', url: buttonUrl }],
              [{ text: 'Audio', url: audio }],
            ],
          },
        };

        bot.sendVideo(chatId, nowm, { caption: caption, parse_mode: 'Markdown', reply_to_message_id: msg.message_id, ...replyMarkup });
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.', { reply_to_message_id: msg.message_id });
      }
    });
  },
};

module.exports = plugin;