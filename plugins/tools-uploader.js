const fetch = require('node-fetch');
const moment = require('moment-timezone');
const { uploader } = require('../lib/uploader');

const plugin = {
  commands: ['/upload', '/tourl'],
  tags: ['tools'],
  init: async (bot) => {
    bot.on('message', async (msg) => {
      const isCommand = msg.caption?.match(/^\/(upload|tourl)/);
      const isReply = msg.reply_to_message 
        && msg.text?.match(/^\/(upload|tourl)$/i) 
        && (msg.reply_to_message.document || msg.reply_to_message.photo || msg.reply_to_message.video);

      if (!isCommand && !isReply) return;

      const media = isReply ? msg.reply_to_message : msg;
      const chatId = msg.chat.id;
      const from = msg.from.username ? `https://t.me/${msg.from.username}` : `tg://user?id=${msg.from.id}`;
      const now = moment().tz('Asia/Jakarta');

      bot.sendMessage(chatId, 'Sedang mengunggah media, mohon tunggu...', {
        reply_to_message_id: msg.message_id,
      });

      try {
        const fileId =
          media.photo?.at(-1)?.file_id ||
          media.document?.file_id ||
          media.video?.file_id;

        if (!fileId)
          return bot.sendMessage(chatId, 'Media tidak didukung.', {
            reply_to_message_id: msg.message_id,
          });

        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        const buffer = await (await fetch(fileUrl)).buffer();

        if (buffer.length > 30 * 1024 * 1024)
          return bot.sendMessage(chatId, '❌ Ukuran file melebihi 30MB.', {
            reply_to_message_id: msg.message_id,
          });

        const link = await uploader(buffer);

        const replyText = [
          `✅ Berhasil diupload`,
          `Pengirim: ${from}`,
          `Ukuran: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
          `Link: ${link}`,
          '',
          `Waktu: ${now.format('HH:mm:ss')}`,
          `Hari: ${now.format('dddd, DD MMMM YYYY')}`,
        ].join('\n');

        bot.sendMessage(chatId, replyText, {
          reply_to_message_id: msg.message_id,
        });
      } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, '❌ Gagal mengupload media.', {
          reply_to_message_id: msg.message_id,
        });
      }
    });

    bot.onText(/^\/(upload|tourl)$/, (msg) => {
      bot.sendMessage(
        msg.chat.id,
        'Silakan kirim media dengan caption `/upload` atau reply media dengan `/upload`.',
        {
          reply_to_message_id: msg.message_id,
          parse_mode: 'Markdown',
        }
      );
    });
  },
};

module.exports = plugin;