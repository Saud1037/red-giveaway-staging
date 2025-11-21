// commands/gend.js
const { endGiveaway } = require('../utils/database');

module.exports = async (message, args) => {
  if (!message.member.permissions.has('ManageEvents')) return message.reply('❌ Permission needed');
  if (args.length === 0) return message.reply('❌ Usage: `!gend <message_id>`');

  const messageId = args[0];
  const giveawayId = Object.keys(global.giveaways).find(id => global.giveaways[id].messageId === messageId);
  if (!giveawayId) return message.reply('❌ No active giveaway found');

  await endGiveaway(giveawayId);
  message.reply('✅ Giveaway ended successfully!');
};