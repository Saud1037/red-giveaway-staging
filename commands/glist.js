// commands/glist.js
const { EmbedBuilder } = require('discord.js');
const { formatTimeLeft } = require('../utils/helpers');

module.exports = async (message, args) => {
  const pageSize = 10;
  const page = parseInt(args[0]) || 1;

  const active = Object.values(global.giveaways).filter(g => g.guildId === message.guild.id);
  if (active.length === 0) return message.reply('📋 No active giveaways currently');

  const totalPages = Math.ceil(active.length / pageSize);
  if (page < 1 || page > totalPages) {
    return message.reply(`❌ Invalid page. Please choose between 1 and ${totalPages}`);
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const giveawaysPage = active.slice(startIndex, endIndex);

  const embed = new EmbedBuilder()
    .setTitle(`📋 Active Giveaways (Page ${page}/${totalPages})`)
    .setColor('#0099ff');

  giveawaysPage.forEach((g, i) => {
    const endTimeMs = new Date(g.endtime).getTime();
    const timeLeft = formatTimeLeft(endTimeMs - Date.now());

    embed.addFields({
      name: `${startIndex + i + 1}. ${g.prize}`,
      value: `**Winners:** ${g.winners}\n**Time Left:** ${timeLeft}\n**ID:** ${g.messageId}`,
      inline: false
    });
  });

  let footerText = `Page ${page}/${totalPages}`;
  if (page < totalPages) {
    footerText = `Next page ➡ !glist ${page + 1} | ${footerText}`;
  }
  embed.setFooter({ text: footerText });

  message.reply({ embeds: [embed] });
};