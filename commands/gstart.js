// commands/gstart.js
const { EmbedBuilder } = require('discord.js');
const { parseTime } = require('../utils/helpers');
const { saveGiveaway } = require('../utils/database');

module.exports = async (message, args) => {
  if (!message.member.permissions.has('ManageEvents')) {
    return message.reply('❌ You need Manage Events permission to use this command');
  }
  if (args.length < 3) {
    return message.reply('❌ Usage: `!gstart <time> <winners_count> <prize>`');
  }

  const timeArg = args[0];
  const winnersCount = parseInt(args[1]);
  const prize = args.slice(2).join(' ');
  const duration = parseTime(timeArg);

  if (duration === 0) return message.reply('❌ Invalid time! Use 1h, 30m, 1d');
  if (isNaN(winnersCount) || winnersCount < 1) return message.reply('❌ Winners count must be > 0');

  message.delete().catch(() => {});

  const giveawayId = Date.now().toString();
  const endTime = new Date(Date.now() + duration).toISOString();

  const embed = new EmbedBuilder()
    .setTitle(`${prize}`)
    .setColor('#FFFF00')
    .setDescription(`🔔 React with 🎉 to enter !
⚙️ Ending: <t:${Math.floor((Date.now() + duration) / 1000)}:R>
↕️ Hosted by: <@${message.author.id}>`)
    .setFooter({ text: `🏆 Winners: ${winnersCount}` });

  const giveawayMessage = await message.channel.send({ embeds: [embed] });
  await giveawayMessage.react('🎉');

  global.giveaways[giveawayId] = {
    id: giveawayId,
    messageId: giveawayMessage.id,
    channelId: message.channel.id,
    guildId: message.guild.id,
    host: message.author.username,
    hostId: message.author.id,
    prize,
    winners: winnersCount,
    endtime: endTime,
    participants: []
  };
  await saveGiveaway(global.giveaways[giveawayId]);
};