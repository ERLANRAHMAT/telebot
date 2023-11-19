let Start = new Date();

const plugin = {
  commands: ['/runtime'],
  tags: ['main'],
  isOwnerByUsername: false,
  isGroup: false,
  init: (bot, { buttonUrl }) => {
    bot.onText(/^\/runtime$/, (msg) => {
      const now = new Date();
      const uptimeMilliseconds = now - Start;
      const uptimeSeconds = Math.floor(uptimeMilliseconds / 1000);
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      const uptimeHours = Math.floor(uptimeMinutes / 60);
      const uptimeDays = Math.floor(uptimeHours / 24);

      const From = msg.chat.id;
      const uptimeMessage = `Active ⚙️: ${uptimeDays} day ${uptimeHours % 24} hours ${uptimeMinutes % 60} minutes ${uptimeSeconds % 60} seconds.`;
      const replyMarkup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Script Bot', url: buttonUrl }],
          ],
        },
      };
      bot.sendMessage(From, uptimeMessage, { reply_to_message_id: msg.message_id, ...replyMarkup });
    });
  }
};

module.exports = plugin;
