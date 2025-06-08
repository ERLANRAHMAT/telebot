const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const uploadFile = require('../lib/uploadFile');
const uploadImage = require('../lib/uploadImage');

const plugin = {
  commands: ['/upload', '/tourl'],
  tags: ['tools'],
  init: async (bot) => {
    bot.on('message', async (msg) => {
      const isCmdUpload = msg.caption?.startsWith('/upload') || msg.caption?.startsWith('/tourl');
      const isReplyUpload = msg.reply_to_message 
        && msg.text 
        && /^\/(upload|tourl)$/i.test(msg.text.trim()) 
        && (msg.reply_to_message.document || msg.reply_to_message.photo || msg.reply_to_message.video);

      if (!isCmdUpload && !isReplyUpload) return;

      const targetMsg = isReplyUpload ? msg.reply_to_message : msg;
      const chatId = msg.chat.id;
      const from = msg.from.username
        ? `https://t.me/${msg.from.username}`
        : `tg://user?id=${msg.from.id}`;

      const now = moment().tz('Asia/Jakarta');
      const time = now.format('HH:mm:ss');
      const date = now.format('DD MMMM YYYY');
      const day = now.format('dddd');
      const timestamp = `Waktu: ${time}\nHari: ${day}, ${date}`;

      bot.sendMessage(chatId, 'Sedang mengunggah media, mohon tunggu...', {
        reply_to_message_id: msg.message_id,
      });

      try {
        let fileId;
        if (targetMsg.photo) {
          fileId = targetMsg.photo[targetMsg.photo.length - 1].file_id;
        } else if (targetMsg.document) {
          fileId = targetMsg.document.file_id;
        } else if (targetMsg.video) {
          fileId = targetMsg.video.file_id;
        } else {
          return bot.sendMessage(chatId, 'Media tidak didukung.', { reply_to_message_id: msg.message_id });
        }

        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        const res = await fetch(fileUrl);
        const buffer = await res.buffer();

        if (buffer.length > 30 * 1024 * 1024) {
          return bot.sendMessage(chatId, '❌ Ukuran file melebihi 30MB.', {
            reply_to_message_id: msg.message_id,
          });
        }

        const isImage = targetMsg.photo || (targetMsg.document && targetMsg.document.mime_type?.startsWith('image'));
        const uploader = isImage ? uploadImage : uploadFile;
        const link = await uploader(buffer);

        const replyText = [
          `✅ Berhasil diupload`,
          `Pengirim: ${from}`,
          `Ukuran: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
          `Link: ${link}`,
          '',
          timestamp,
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

    bot.onText(/^\/(upload|tourl)$/, async (msg) => {
      bot.sendMessage(msg.chat.id, 'Silakan kirim media dengan caption `/upload` atau reply media dengan `/upload`.', {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown',
      });
    });
  },
};

module.exports = plugin;