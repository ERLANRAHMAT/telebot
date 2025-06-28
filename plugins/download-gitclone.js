const fetch = require('node-fetch');

const plugin = {
  commands: ['/gitclone'],
  tags: ['download'],
  init: (bot, { mess }) => {
    const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;

    bot.onText(/^\/gitclone(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const input = match[1];

      if (!input) {
        return bot.sendMessage(chatId, '🔗 Link GitHub-nya mana? contoh:\n`/gitclone https://github.com/ERLANRAHMAT/telebot`', {
          parse_mode: 'Markdown',
          reply_to_message_id: msg.message_id
        });
      }

      if (!regex.test(input)) {
        return bot.sendMessage(chatId, '❌ Link tidak valid!', {
          reply_to_message_id: msg.message_id
        });
      }

      try {
        const [, user, repoRaw] = input.match(regex);
        const repo = repoRaw.replace(/\.git$/, '').replace(/\/$/, '');
        const zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`;

        bot.sendMessage(chatId, '⏳ Sedang mengambil repository...', {
          reply_to_message_id: msg.message_id
        });

        const res = await fetch(zipUrl);
        if (!res.ok) throw new Error(`Gagal download zip: ${res.status}`);

        const buffer = await res.buffer();
        const fileOpts = {
          filename: `${repo}.zip`,
          contentType: 'application/zip'
        };

        await bot.sendDocument(chatId, buffer, {
          caption: `📦 *Berhasil didapatkan!*\nRepository: \`${user}/${repo}\``,
          parse_mode: 'Markdown',
          reply_to_message_id: msg.message_id
        }, fileOpts);
      } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, '⚠️ Terjadi kesalahan saat mengunduh repository.', {
          reply_to_message_id: msg.message_id
        });
      }
    });
  }
};

module.exports = plugin;