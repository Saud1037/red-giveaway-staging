// index.js
const { Client, IntentsBitField } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// استيراد الأوامر
const gstartCommand = require('./commands/gstart');
const gendCommand = require('./commands/gend');
const glistCommand = require('./commands/glist');
const grerollCommand = require('./commands/greroll');
const greetCommand = require('./commands/greet');
const helpCommand = require('./commands/help');

// استيراد المساعدات
const { loadGiveaways, loadGreetSettings, endGiveaway } = require('./utils/database');
const { handleReactionAdd, handleReactionRemove } = require('./utils/reactions');
const { handleMemberAdd } = require('./utils/greeting');

// إعداد البوت
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMembers
  ]
});

// إعداد Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// تصدير للاستخدام في الملفات الأخرى
global.client = client;
global.supabase = supabase;
global.giveaways = {};
global.greetSettings = {};

// عند تشغيل البوت
client.once('ready', async () => {
  console.log(`Bot is ready: ${client.user.tag}`);
  await loadGiveaways();
  await loadGreetSettings();

  // فحص القيفاويات المنتهية كل 5 ثواني
  setInterval(() => {
    const now = Date.now();
    for (const [giveawayId, giveaway] of Object.entries(global.giveaways)) {
      if (now >= new Date(giveaway.endtime).getTime()) {
        endGiveaway(giveawayId);
      }
    }
  }, 5000);
});

// رسالة ترحيب عند دخول عضو
client.on('guildMemberAdd', handleMemberAdd);

// معالجة الأوامر
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // توجيه الأوامر
  switch (command) {
    case 'gstart':
      await gstartCommand(message, args);
      break;
    case 'gend':
      await gendCommand(message, args);
      break;
    case 'glist':
      await glistCommand(message, args);
      break;
    case 'greroll':
      await grerollCommand(message, args);
      break;
    case 'greet':
      await greetCommand(message, args);
      break;
    case 'help':
      await helpCommand(message, args);
      break;
  }
});

// التفاعلات
client.on('messageReactionAdd', handleReactionAdd);
client.on('messageReactionRemove', handleReactionRemove);

// تسجيل الدخول
client.login(process.env.DISCORD_TOKEN);