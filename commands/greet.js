// commands/greet.js
const { EmbedBuilder } = require('discord.js');
const { parseTime, formatTimeLeft } = require('../utils/helpers');
const { saveGreetSettings } = require('../utils/database');
const { scheduleGreetMessageDeletion } = require('../utils/greeting');

module.exports = async (message, args) => {
  if (!message.member.permissions.has('ManageGuild')) {
    return message.reply('❌ You need Manage Server permission to use this command');
  }

  const subCommand = args[0];

  // إنشاء إعدادات جديدة إذا لم تكن موجودة
  if (!global.greetSettings[message.guild.id]) {
    global.greetSettings[message.guild.id] = {
      guild_id: message.guild.id,
      channels: [],
      message: 'Welcome {mention} 🎉',
      delete_time: 0
    };
  }

  // !greet → إضافة/إزالة قناة الترحيب
  if (!subCommand) {
    const settings = global.greetSettings[message.guild.id];
    const channelId = message.channel.id;
    
    if (settings.channels.includes(channelId)) {
      // إزالة القناة
      settings.channels = settings.channels.filter(id => id !== channelId);
      await saveGreetSettings(message.guild.id);
      return message.reply(`✅ Greeting channel ${message.channel} removed`);
    } else {
      // إضافة القناة
      settings.channels.push(channelId);
      await saveGreetSettings(message.guild.id);
      return message.reply(`✅ Greeting channel ${message.channel} added`);
    }
  }

  // !greet set <message>
  if (subCommand === 'set') {
    const customMessage = args.slice(1).join(' ');
    if (!customMessage) return message.reply('❌ Usage: `!greet set <message>`');

    global.greetSettings[message.guild.id].message = customMessage;
    await saveGreetSettings(message.guild.id);
    return message.reply('✅ Greeting message updated!');
  }

  // !greet time <duration>
  if (subCommand === 'time') {
    const timeArg = args[1];
    if (!timeArg) return message.reply('❌ Usage: `!greet time <duration>` (e.g., 5s, 10m, 1h)');

    const timeMs = parseTime(timeArg);
    if (timeMs === 0) return message.reply('❌ Invalid time! Use format like 5s, 10m, 1h, 1d');

    global.greetSettings[message.guild.id].delete_time = timeMs;
    await saveGreetSettings(message.guild.id);
    return message.reply(`✅ Greeting messages will be deleted after ${formatTimeLeft(timeMs)}`);
  }

  // !greet reset → إزالة كل القنوات فقط
  if (subCommand === 'reset') {
    global.greetSettings[message.guild.id].channels = [];
    await saveGreetSettings(message.guild.id);
    return message.reply('✅ All greeting channels removed');
  }

  // !greet clear → إعادة تعيين كل شيء
  if (subCommand === 'clear') {
    await global.supabase.from('greet_settings').delete().eq('guild_id', message.guild.id);
    delete global.greetSettings[message.guild.id];
    return message.reply('✅ All greeting settings cleared');
  }

  // !greet test
  if (subCommand === 'test') {
    const settings = global.greetSettings[message.guild.id];
    if (!settings || !settings.channels || settings.channels.length === 0) {
      return message.reply('❌ No greeting channels set up');
    }
    
    const testMessage = settings.message
      .replace(/{mention}/g, `<@${message.author.id}>`)
      .replace(/{username}/g, message.author.username);
    
    let sentCount = 0;
    for (const channelId of settings.channels) {
      const channel = message.guild.channels.cache.get(channelId);
      if (channel) {
        try {
          const sentMessage = await channel.send(testMessage);
          scheduleGreetMessageDeletion(sentMessage, settings.delete_time);
          sentCount++;
        } catch (error) {
          console.error('Error sending test message:', error);
        }
      }
    }
    
    return message.reply(`✅ Test greeting sent to ${sentCount} channel(s)!`);
  }

  // !greet stats
  if (subCommand === 'stats') {
    const settings = global.greetSettings[message.guild.id];
    const embed = new EmbedBuilder()
      .setTitle('👋 Greeting Settings')
      .setColor('#00ff00');

    if (!settings || !settings.channels || settings.channels.length === 0) {
      embed.addFields({ name: 'Channels', value: 'No channels' });
    } else {
      const validChannels = settings.channels
        .map(id => message.guild.channels.cache.get(id))
        .filter(channel => channel)
        .map(channel => `<#${channel.id}>`)
        .join(', ') || 'No valid channels';
      embed.addFields({ name: 'Channels', value: validChannels });
    }

    embed.addFields(
      { name: 'Message', value: settings?.message || 'Welcome {mention} 🎉' },
      { 
        name: 'Delete Time', 
        value: settings?.delete_time > 0 
          ? formatTimeLeft(settings.delete_time) 
          : 'No auto-delete' 
      }
    );

    return message.reply({ embeds: [embed] });
  }
};