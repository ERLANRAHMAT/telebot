const fs = require('fs');
const path = require('path');

const plugin = {
  commands: [
    '/gp',
  ],
  tags: ['owner'],
  init: (bot, { isOwner, mess }) => {
    bot.onText(/^\/gp(?:\s+(.+))?$/, (msg, match) => {
      if (isOwner(msg.from.username)) {
        bot.sendMessage(msg.chat.id, mess.owner, { reply_to_message_id: msg.message_id });
        return;
      }

      try {
        const command = (match[1] || '').toLowerCase();
        if (!command) throw 'Where is the name?\n\nExample: /gp main-menu';

        const filename = path.join(__dirname, `./${command}${!/\.js$/i.test(command) ? '.js' : ''}`);
        const listPlugins = fs.readdirSync(path.join(__dirname)).map(v => v.replace(/\.js/, ''));

        if (!fs.existsSync(filename)) {
          const errorMessage = `'${filename}' not found!\n${listPlugins.join('\n').trim()}`;
          bot.sendMessage(msg.chat.id, errorMessage.trim(), { reply_to_message_id: msg.message_id });
          return;
        }

        const fileContent = fs.readFileSync(filename, 'utf8');
        bot.sendMessage(msg.chat.id, fileContent, { reply_to_message_id: msg.message_id });
      } catch (error) {
        bot.sendMessage(msg.chat.id, String(error), { reply_to_message_id: msg.message_id });
      }
    });
  },
};

module.exports = plugin;
