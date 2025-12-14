const { EmbedBuilder } = require('discord.js');
const supabase = require('../supabase');
const store = require('../store');
const { selectWinners } = require('../utils/winners');

async function loadGiveaways() {
  const { data, error } = await supabase.from('giveaways').select('*');
  if (error) {
    console.error('Error loading giveaways:', error);
    return;
  }

  store.giveaways = {};
  data.forEach(g => {
    store.giveaways[g.id] = g;
  });
}

async function saveGiveaway(giveaway) {
  const { error } = await supabase.from('giveaways').upsert(giveaway);
  if (error) console.error('Error saving giveaway:', error);
}

async function deleteGiveaway(id) {
  const { error } = await supabase.from('giveaways').delete().eq('id', id);
  if (error) console.error('Error deleting giveaway:', error);
}

async function endGiveaway(client, giveawayId) {
  const giveaway = store.giveaways[giveawayId];
  if (!giveaway) return;

  try {
    const channel = await client.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);

    let winners = [];
    if (giveaway.participants.length >= giveaway.winners) {
      winners = selectWinners(giveaway.participants, giveaway.winners);
    }

    const embed = new EmbedBuilder().setColor('#FF0000').setTimestamp();

    if (winners.length > 0) {
      const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
      embed
        .setTitle(`${giveaway.prize}`)
        .setDescription(`🔔 Winner(s): ${winnerMentions}
⚙️ Ending: Ended
↕️ Hosted by: <@${giveaway.hostId}>`)
        .setFooter({ text: `1` });

      await channel.send(`🎊 Congratulations ${winnerMentions}! You won **${giveaway.prize}**! 🎉`);
    } else {
      embed
        .setTitle(`🎉 ${giveaway.prize} 🎉`)
        .setDescription(`🔔 Winner(s): No valid entries
⚙️ Ending: Ended
↕️ Hosted by: <@${giveaway.hostId}>`)
        .setFooter({ text: `1` });
    }

    await message.edit({ embeds: [embed] });

    const { error } = await supabase.from('ended_giveaways').insert([{
      ...giveaway,
      endedAt: new Date().toISOString(),
      winners_list: winners,
    }]);
    if (error) console.error('Error saving ended giveaway:', error);

    await deleteGiveaway(giveawayId);
    delete store.giveaways[giveawayId];
  } catch (error) {
    console.error('Error ending giveaway:', error);
  }
}

module.exports = {
  loadGiveaways,
  saveGiveaway,
  deleteGiveaway,
  endGiveaway,
};