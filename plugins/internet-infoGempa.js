const axios = require('axios');

const plugin = {
  commands: ['/infogempa', '/gempa'],
  tags: ['internet'],
  init: (bot, { api, apikey, mess }) => {
    bot.onText(/^\/(infogempa|gempa)/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        const response = await axios.get(`${api}/api/search/gempa?apikey=${apikey}`);
        const dataGempa = response.data.result.result;

        const caption = 
          `🗓️ *Waktu:* ${dataGempa.waktu}\n` +
          `📍 *Lintang:* ${dataGempa.Lintang}\n` +
          `📍 *Bujur:* ${dataGempa.Bujur}\n` +
          `🌋 *Magnitude:* ${dataGempa.Magnitudo}\n` +
          `⛏️ *Kedalaman:* ${dataGempa.Kedalaman}\n` +
          `📌 *Wilayah:* ${dataGempa.Wilayah}`;

        await bot.sendPhoto(chatId, dataGempa.image, {
          caption,
          parse_mode: 'Markdown',
          reply_to_message_id: msg.message_id
        });
      } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, '⚠️ Terjadi kesalahan saat mengambil data gempa.', {
          reply_to_message_id: msg.message_id
        });
      }
    });
  }
};

module.exports = plugin;