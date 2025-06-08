const fetch = require('node-fetch');

const plugin = {
  commands: ['/dailyidea', '/idegila', '/ngapainya'],
  tags: ['openai'],
  init: async (bot, { mess, api, apikey }) => {

    const generateIdea = async (inputText) => {
      const logic = `Lo adalah temen ngobrol yang kreatif dan nyentrik. Kasih ide aktivitas random tapi seru, bisa yang receh sampai yang agak nyeleneh. Gaya bahasa casual banget, kaya lagi ngobrol sama temen. Pake bahasa gaul, singkatan, dan emoji secukupnya. Jangan terlihat kaya AI, tapi kaya manusia beneran yang lagi ngasih ide.`;

      const res = await fetch(`${api}/api/search/openai-logic?text=Kasih ide aktivitas random buat: ${encodeURIComponent(inputText)}&logic=${encodeURIComponent(logic)}&apikey=${apikey}`);
      const json = await res.json();
      if (!json.message) throw new Error('Empty response');

      const templates = [
        `Nih gw punya ide buat lu:\n${json.message}\n\nGimana? Keren kan ide gw 😎`,
        `Wkwkwk ini dia solusi gabut lu:\n${json.message}\n\nDijamin anti mainstream!`,
        `Denger2 lu ${inputText}? Gw punya solusi nih:\n${json.message}\n\nAsli ini ide gila sih 😂`,
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    };

    bot.onText(/^\/(?:dailyidea|idegila|ngapainya)(?: (.+))?$/, async (msg, match) => {
      const chatId = msg.chat.id;
      const inputText = match[1];
      if (!inputText) {
        return bot.sendMessage(chatId, `Bro... lu kasi clue dong mau ngapain. Gw ga bisa baca pikiran wkwk 😆\n\nContoh:\n*/dailyidea* malem minggu, ga ada duid`, {
          reply_to_message_id: msg.message_id,
          parse_mode: 'Markdown',
        });
      }

      bot.sendMessage(chatId, 'Otw mikir... bentar ya gan 🤔💨', {
        reply_to_message_id: msg.message_id,
      });

      try {
        const idea = await generateIdea(inputText);

        await bot.sendMessage(chatId, idea, {
          reply_to_message_id: msg.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔁 ide lain?', callback_data: `other_idea|${inputText}` }],
            ],
          },
        });
      } catch (e) {
        bot.sendMessage(chatId, '😵 Waduh, lagi buntu nih. Coba lagi nanti ya!');
      }
    });

    bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;
      const data = query.data;

      if (data.startsWith('other_idea|')) {
        const inputText = data.split('|')[1];
        try {
          const idea = await generateIdea(inputText);

          await bot.editMessageText(idea, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔁 ide lain?', callback_data: `other_idea|${inputText}` }],
              ],
            },
          });
        } catch (e) {
          await bot.answerCallbackQuery(query.id, { text: 'Gagal generate ide ulang 🧠💥', show_alert: true });
        }
      }
    });
  },
};

module.exports = plugin;