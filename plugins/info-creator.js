const plugin = {
  commands: ['/owner', '/creator'],
  tags: ['info'],
  init: (bot, { ownerNumber, ownerName }) => {
    bot.onText(/^\/(owner|creator)$/, async (msg) => {
      const chatId  = msg.chat.id;
      const user = msg.from;
      const isOwnerCommand = msg.text === '/owner' || msg.text === '/creator';

      if (isOwnerCommand) {
       const caption = `Hi ${user.first_name}! This is my owner\nThe name is: ${ownerName}\nThe number is: ${ownerNumber}`
      const replyMarkup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'My Owner', url: "https://t.me/"+ownerName }],
          ],
        },
      };
      bot.sendMessage(chatId, caption, { reply_to_message_id: msg.message_id, ...replyMarkup });     
      }
    });
  },
};

module.exports = plugin;
