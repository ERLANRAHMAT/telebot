const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const { tmpdir } = require('os');

const plugin = {
  commands: ['/makerbrat', '/brat', '/bratvid', '/bratvideo'],
  tags: ['tools'],
  init: (bot, { api, apikey, mess }) => {
    bot.onText(/^\/(makerbrat|brat|bratvid|bratvideo)(?:\s+(.+))?$/i, async (msg, match) => {
      const chatId = msg.chat.id;
      const command = match[1];
      const text = match[2] || (
        msg.reply_to_message &&
        typeof msg.reply_to_message.text === 'string'
          ? msg.reply_to_message.text
          : null
      );

      if (!text || text.trim().length === 0) {
        return bot.sendMessage(
          chatId,
          'Harap masukkan teks setelah perintah atau reply ke pesan yang mengandung teks.\nContoh: /brat Betabotz Api atau reply ke pesan\n Untuk Brat Video: /bratvid Hidup cangcut Hidup Blonde',
          { reply_to_message_id: msg.message_id }
        );
      }

      const waitMsg = await bot.sendMessage(chatId, '🎬 Sedang membuat stiker Brat...', {
        reply_to_message_id: msg.message_id
      });

      try {
        const isVideo = command.includes('vid');
        const endpoint = isVideo ? 'brat-video' : 'brat';

        const apiUrl = `${api}/api/maker/${endpoint}?apikey=${apikey}&text=${encodeURIComponent(text.substring(0, 151))}`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`Gagal fetch dari API (status ${res.status})`);
        const buffer = await res.buffer();

        const tempInput = path.join(tmpdir(), `brat-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`);
        const tempOutput = path.join(tmpdir(), `brat-sticker-${Date.now()}.${isVideo ? 'webm' : 'webp'}`);
        fs.writeFileSync(tempInput, buffer);

        if (isVideo) {
          await new Promise((resolve, reject) => {
            ffmpeg(tempInput)
              .outputOptions([
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
                '-c:v', 'libvpx-vp9',
                '-b:v', '500K',
                '-an',
                '-auto-alt-ref', '0'
              ])
              .output(tempOutput)
              .on('end', resolve)
              .on('error', reject)
              .run();
          });
        } else {
          
          await sharp(tempInput).resize(512, 512, { fit: 'cover' }).webp().toFile(tempOutput);
        }

        await bot.sendSticker(chatId, fs.createReadStream(tempOutput), {
          reply_to_message_id: msg.message_id
        });

        await bot.deleteMessage(chatId, waitMsg.message_id);
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);
      } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, mess.eror, { reply_to_message_id: msg.message_id });
      }
    });
  }
};

module.exports = plugin;