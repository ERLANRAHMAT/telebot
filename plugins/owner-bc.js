const plugin = {
  commands: [
    '/broadcast',
    '/bc',
  ],
  tags: ['owner'],
  init: (bot, { isOwner, ownerUsername, mess }) => {
    const usersMap = new Map();
    bot.onText(/^(\/broadcast|\/bc)(.+)?$/, (msg, match) => {
      const chatId = msg.chat.id;
      const broadcastMessage = match[2];
      if (isOwner(msg.from.username)) {
        bot.sendMessage(chatId, mess.owner, { reply_to_message_id: msg.message_id });
        return;
      }
      if (!broadcastMessage) {
        bot.sendMessage(chatId, 'Input Text!', { reply_to_message_id: msg.message_id });
        return;
      }

      usersMap.forEach((userInfo, userId) => {
        bot.sendMessage(userId, broadcastMessage, { reply_to_message_id: userInfo.messageId });
      });
    });

    bot.on('message', (msg) => {
      const userId = msg.from.id;
      const userInfo = {
        username: msg.from.username,
        phoneNumber: msg.from.contact ? msg.from.contact.phone_number : 'N/A',
        userId: msg.from.id,
        messageId: msg.message_id,
      };
      usersMap.set(userId, userInfo);
    });
  },
};

module.exports = plugin;