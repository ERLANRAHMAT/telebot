/*
const fetch = require('node-fetch');

const plugin = {
  commands: ['/ai'],
  tags: ['openai'],
  init: async (bot, { buttonUrl, mess, api, apikey }) => {
    bot.onText(/^\/ai(?: (.+))?$/, async (msg, match) => {
      const chatId = msg.chat.id;
      const inputText = match[1];
      if (!inputText) {
        bot.sendMessage(chatId, 'Input Query! Example /ai hai', { reply_to_message_id: msg.message_id });
        return;
      }
      bot.sendMessage(chatId, mess.wait, { reply_to_message_id: msg.message_id });
      try {
        const response = await fetch(api + '/api/search/openai-chat?apikey=' + apikey + '&text=' + encodeURIComponent(inputText));
        const responseMessage = await response.json();

        const replyMarkup = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Script Bot', url: buttonUrl }],
            ],
          },
        };

       bot.sendPhoto(chatId, 'https://telegra.ph/file/7a385897829927b981dfa.jpg', { caption: responseMessage.message, parse_mode: 'Markdown', reply_to_message_id: msg.message_id, ...replyMarkup });                                
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.',  { reply_to_message_id: msg.message_id });
      }
    });
  },
};

module.exports = plugin;
*/

//versi session

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment-timezone');
moment.locale('id');

const plugin = {
  commands: ['/ai'],
  tags: ['openai'],

  dataDir: path.join(process.cwd(), 'data'),
  sessionFile: path.join(process.cwd(), 'data', 'sessions.json'),
  
  init: async (bot, { api, apikey }) => {

    const ensureDataDir = async () => {
      try {
        await fs.access(plugin.dataDir);
      } catch (error) {
        await fs.mkdir(plugin.dataDir, { recursive: true });
        console.log('Created data directory:', plugin.dataDir);
      }
    };

    const loadSessions = async () => {
      try {
        await ensureDataDir();
        const data = await fs.readFile(plugin.sessionFile, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        return {};
      }
    };

    const saveSessions = async (sessions) => {
      try {
        await ensureDataDir();
        await fs.writeFile(plugin.sessionFile, JSON.stringify(sessions, null, 2));
      } catch (error) {
        console.error('Error saving sessions:', error);
      }
    };

    const getSession = async (userId) => {
      const sessions = await loadSessions();
      
      if (!sessions[userId]) {
        const now = moment().tz('Asia/Jakarta');
        sessions[userId] = {
          conversation: [],
          createdAt: {
            Time: now.format('HH:mm:ss'),
            Days: now.format('dddd, D MMMM YYYY')
          },
          lastActivity: {
            Time: now.format('HH:mm:ss'),
            Days: now.format('dddd, D MMMM YYYY')
          }
        };
        await saveSessions(sessions);
      }
      
      return sessions[userId];
    };

    const updateSession = async (userId, sessionData) => {
      const sessions = await loadSessions();
      sessions[userId] = sessionData;
      await saveSessions(sessions);
    };

    const cleanOldSessions = async () => {
      const sessions = await loadSessions();
      const now = moment().tz('Asia/Jakarta');
      let hasChanges = false;
      
      for (const userId in sessions) {
        const lastActivityDate = moment(`${sessions[userId].lastActivity.Days} ${sessions[userId].lastActivity.Time}`, 'dddd, D MMMM YYYY HH:mm:ss');
        const daysDiff = now.diff(lastActivityDate, 'days');
        
        if (daysDiff > 7) {
          delete sessions[userId];
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        await saveSessions(sessions);
        console.log('Cleaned old sessions');
      }
    };

    setInterval(cleanOldSessions, 6 * 60 * 60 * 1000);

    bot.onText(/^\/ai(?: (.+))?$/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const inputText = match[1];
      
      if (!inputText) {
        bot.sendMessage(chatId, 'Input Query! Example /ai hai', { reply_to_message_id: msg.message_id });
        return;
      }
      
      const aiWait = `Sedang mempersiapkan jawaban dari *${inputText}*...`;
const waitMsg = await bot.sendMessage(chatId, aiWait, { 
  reply_to_message_id: msg.message_id,
  parse_mode: 'Markdown'
});
      
      try {
        const session = await getSession(userId);
        const now = moment().tz('Asia/Jakarta');
        session.conversation.push({
          role: 'user',
          content: inputText,
          timestamp: {
            Time: now.format('HH:mm:ss'),
            Days: now.format('dddd, D MMMM YYYY')
          }
        });

        session.lastActivity = {
          Time: now.format('HH:mm:ss'),
          Days: now.format('dddd, D MMMM YYYY')
        };
        if (session.conversation.length > 60) {
          session.conversation = session.conversation.slice(-60);
        }

        let contextText = inputText;
        if (session.conversation.length > 1) {
          const recentMessages = session.conversation.slice(-6); 
          contextText = recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n') + '\n\nCurrent: ' + inputText;
        }
        
        const response = await fetch(api + '/api/search/openai-chat?apikey=' + apikey + '&text=' + encodeURIComponent(contextText));
        const responseMessage = await response.json();
        
        const nowResponse = moment().tz('Asia/Jakarta');
        session.conversation.push({
          role: 'assistant',
          content: responseMessage.message,
          timestamp: {
            Time: nowResponse.format('HH:mm:ss'),
            Days: nowResponse.format('dddd, D MMMM YYYY')
          }
        });
        
        await updateSession(userId, session);

        bot.sendPhoto(chatId, 'https://telegra.ph/file/7a385897829927b981dfa.jpg', { 
          caption: responseMessage.message, 
          parse_mode: 'Markdown', 
          reply_to_message_id: msg.message_id
        });
        
        await bot.deleteMessage(chatId, waitMsg.message_id);
        
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.', { reply_to_message_id: msg.message_id });
      }
    });
    
    await ensureDataDir();
    cleanOldSessions();
  },
};

module.exports = plugin;