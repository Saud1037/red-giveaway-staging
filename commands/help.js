// commands/help.js
const { EmbedBuilder } = require('discord.js');

module.exports = async (message, args) => {
  const helpEmbed = new EmbedBuilder()
    .setTitle('🎉 Giveaway Bot - Commands')
    .setColor('#FF0000')
    .setDescription('All available giveaway bot commands:')
    .addFields(
      {
        name: '🚀 !gstart `<time>` `<winners_count>` `<prize>`',
        value: 'Start a new giveaway'
      },
      {
        name: '🗑️ !gend `<message_id>`',
        value: 'End a giveaway manually'
      },
      {
        name: '📋 !glist',
        value: 'Show list of active giveaways'
      },
      {
        name: '🔄 !greroll `<message_id>`',
        value: 'Reroll winners for a giveaway'
      },
      {
        name: '👋 !greet',
        value: `Manage greeting settings:
- \`!greet\` → Add/remove greeting channel
- \`!greet set <message>\` → Set custom greeting
- \`!greet time <duration>\` → Set auto-delete time
- \`!greet reset\` → Remove all channels
- \`!greet clear\` → Reset everything
- \`!greet test\` → Test greeting
- \`!greet stats\` → Show current settings
\nVariables: {mention}, {username}`
      }
    );
  message.reply({ embeds: [helpEmbed] });
};