const fs = require('fs');
const path = require('path');

const plugin = {
  commands: [
    '/sf',
  ],
  tags: ['owner'],
  init: (bot, { isOwner, mess }) => {
    bot.onText(/^\/sf(?:\s+(.+))?$/, async (msg, match) => {
      if (isOwner(msg.from.username)) {
        bot.sendMessage(msg.chat.id, mess.owner, { reply_to_message_id: msg.message_id });
        return;
      }

      try {
        const text = (match[1] || '').trim();
        if (!text) throw 'Uhm.. where is the code?\n\nUsage:\n/sf <filename>\n\nExample:\n/sf plugins/lann.js';

        const replyMessage = msg.reply_to_message;
        if (!replyMessage || !replyMessage.text) throw 'Reply to the message you want to save!';

        fs.writeFileSync(text, replyMessage.text);

        bot.sendMessage(msg.chat.id, `Saved to ${text}`, { reply_to_message_id: msg.message_id });
      } catch (error) {
        bot.sendMessage(msg.chat.id, String(error), { reply_to_message_id: msg.message_id });
      }
    });
  },
};

module.exports = plugin;
