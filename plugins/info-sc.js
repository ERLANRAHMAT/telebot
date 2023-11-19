const plugin = {
  commands: ['/sc'],
  tags: ['info'],
  init: (bot, { buttonUrl }) => {
    bot.onText(/^\/sc$/, (msg) => {
      const From = msg.chat.id;
      const user = msg.from;
      const caption = `Hi ${user.first_name}! This Bot Uses Script From`;
      const replyMarkup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Script Bot', url: buttonUrl }],
          ],
        },
      };
      bot.sendMessage(From, caption, { reply_to_message_id: msg.message_id, ...replyMarkup });
    });
  }
};

module.exports = plugin;
