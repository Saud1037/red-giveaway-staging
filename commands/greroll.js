// commands/greroll.js
const { selectWinners } = require('../utils/helpers');

module.exports = async (message, args) => {
  if (!message.member.permissions.has('ManageEvents')) return message.reply('❌ Permission needed');
  if (args.length === 0) return message.reply('❌ Usage: `!greroll <message_id>`');

  const messageId = args[0];
  const { data, error } = await global.supabase.from('ended_giveaways').select('*').eq('messageId', messageId);
  if (error || !data || data.length === 0) return message.reply('❌ No ended giveaway found');

  const giveaway = data[0];
  if (giveaway.participants.length === 0) return message.reply('❌ No participants to reroll');

  const newWinners = selectWinners(giveaway.participants, giveaway.winners);
  const mentions = newWinners.map(id => `<@${id}>`).join(', ');
  message.channel.send(`🔄 Congratulations ${mentions}! You are the new winners of **${giveaway.prize}**!`);
};