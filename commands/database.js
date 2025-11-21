// utils/database.js
const { EmbedBuilder } = require('discord.js');
const { selectWinners } = require('./helpers');

// تحميل القيفاويات من قاعدة البيانات
async function loadGiveaways() {
  const { data, error } = await global.supabase.from('giveaways').select('*');
  if (error) {
    console.error('Error loading giveaways:', error);
  } else {
    global.giveaways = {};
    data.forEach(g => {
      global.giveaways[g.id] = g;
    });
  }
}

// تحميل إعدادات الترحيب
async function loadGreetSettings() {
  const { data, error } = await global.supabase.from('greet_settings').select('*');
  if (error) {
    console.error('Error loading greet settings:', error);
  } else {
    global.greetSettings = {};
    data.forEach(s => {
      global.greetSettings[s.guild_id] = {
        guild_id: s.guild_id,
        channels: s.channels || [],
        message: s.message || 'Welcome {mention} 🎉',
        delete_time: s.delete_time || 0
      };
    });
  }
}

// حفظ/تحديث قيفاوي
async function saveGiveaway(giveaway) {
  const { error } = await global.supabase.from('giveaways').upsert(giveaway);
  if (error) console.error('Error saving giveaway:', error);
}

// حذف قيفاوي
async function deleteGiveaway(id) {
  const { error } = await global.supabase.from('giveaways').delete().eq('id', id);
  if (error) console.error('Error deleting giveaway:', error);
}

// حفظ إعدادات الترحيب
async function saveGreetSettings(guildId) {
  const settings = global.greetSettings[guildId];
  if (!settings) return;
  
  const { error } = await global.supabase.from('greet_settings').upsert({
    guild_id: settings.guild_id,
    channels: settings.channels,
    message: settings.message,
    delete_time: settings.delete_time
  });
  if (error) console.error('Error saving greet settings:', error);
}

// إنهاء القيفاوي
async function endGiveaway(giveawayId) {
  const giveaway = global.giveaways[giveawayId];
  if (!giveaway) return;

  try {
    const channel = await global.client.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);

    let winners = [];
    if (giveaway.participants.length >= giveaway.winners) {
      winners = selectWinners(giveaway.participants, giveaway.winners);
    }

    const embed = new EmbedBuilder().setColor('#FF0000').setTimestamp();

    if (winners.length > 0) {
      const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
      embed.setTitle(`${giveaway.prize}`)
        .setDescription(`🔔 Winner(s): ${winnerMentions}
⚙️ Ending: Ended
↕️ Hosted by: <@${giveaway.hostId}>`)
        .setFooter({ text: `1` });

      await channel.send(`🎊 Congratulations ${winnerMentions}! You won **${giveaway.prize}**! 🎉`);
    } else {
      embed.setTitle(`🎉 ${giveaway.prize} 🎉`)
        .setDescription(`🔔 Winner(s): No valid entries
⚙️ Ending: Ended
↕️ Hosted by: <@${giveaway.hostId}>`)
        .setFooter({ text: `1` });
    }

    await message.edit({ embeds: [embed] });

    const { error } = await global.supabase.from('ended_giveaways').insert([{
      ...giveaway,
      endedAt: new Date().toISOString(),
      winners_list: winners
    }]);
    if (error) console.error('Error saving ended giveaway:', error);

    await deleteGiveaway(giveawayId);
    delete global.giveaways[giveawayId];
  } catch (error) {
    console.error('Error ending giveaway:', error);
  }
}

module.exports = {
  loadGiveaways,
  loadGreetSettings,
  saveGiveaway,
  deleteGiveaway,
  saveGreetSettings,
  endGiveaway
};