// src/events/messageCreate.js

const { EmbedBuilder } = require('discord.js');
const supabase = require('../supabase');
const store = require('../store');
const os = require('os');

const { endGiveaway, saveGiveaway } = require('../services/giveawayService');
const { saveGreetSettings, scheduleGreetMessageDeletion } = require('../services/greetService');

const { logError, getErrors } = require('../utils/errorBuffer');
const { parseTime, formatTimeLeft } = require('../utils/time');
const { selectWinners } = require('../utils/winners');

// 🔐 Owner only
const OWNER_ID = process.env.OWNER_ID;

function registerMessageCreate(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const isOwner = message.author.id === OWNER_ID;

   const PREFIX = '!';

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // ✅ Debug: شوف وش يقرا البوت
  if (message.content.startsWith(PREFIX)) {
    console.log('COMMAND MESSAGE:', message.content);
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = (args.shift() || '').toLowerCase();

  if (!command) return;

  // ✅ Debug: يرد لك اسم الأمر اللي فهمه
  if (command === 'ping') {
    return message.reply('pong ✅');
  }

  // باقي أوامرك...
});


    /* =========================
       🔐 OWNER-ONLY COMMANDS
       ========================= */


       // عدد السيرفرات فقط
    if (command === 'botservers') {
      if (!isOwner) return;
      return message.reply(`🌐 **Total Servers:** ${client.guilds.cache.size}`);
    }

    // قائمة السيرفرات (اسم + ID + أعضاء)
    else if (command === 'botserverlist') {
      if (!isOwner) return;

      const servers = client.guilds.cache
        .map(g => `• **${g.name}** | ID: \`${g.id}\` | Members: **${g.memberCount}**`)
        .sort((a, b) => a.localeCompare(b));

      const maxLength = 1800;
      let buffer = `📌 **Bot Servers (${servers.length})**\n\n`;

      for (const line of servers) {
        if ((buffer + line + '\n').length > maxLength) {
          await message.reply(buffer);
          buffer = '';
        }
        buffer += line + '\n';
      }

      if (buffer.trim()) await message.reply(buffer);
      return;
    }

// عدد الأعضاء في كل السيرفرات
else if (command === 'botmembers') {
  if (!isOwner) return;

  let total = 0;
  client.guilds.cache.forEach(guild => {
    total += guild.memberCount;
  });

  return message.reply(`👥 **Total Members:** ${total}`);
}

    // البحث عن سيرفر
    else if (command === 'botserverfind') {
      if (!isOwner) return;

      const query = args.join(' ').trim();
      if (!query) return message.reply('❌ Usage: `!botserverfind <name or server_id>`');

      const exact = client.guilds.cache.get(query);
      if (exact) {
        return message.reply(
          `✅ Found:\n• **${exact.name}** | ID: \`${exact.id}\` | Members: **${exact.memberCount}**`
        );
      }

      const qLower = query.toLowerCase();
      const results = client.guilds.cache
        .filter(g => g.name.toLowerCase().includes(qLower))
        .map(g => `• **${g.name}** | ID: \`${g.id}\` | Members: **${g.memberCount}**`)
        .slice(0, 10);

      if (results.length === 0) return message.reply('❌ No matches found.');
      return message.reply(`🔎 Results (max 10):\n${results.join('\n')}`);
    }

    // Ping
    else if (command === 'botping') {
      if (!isOwner) return;
      const sent = await message.reply('🏓 Pinging...');
      const latency = sent.createdTimestamp - message.createdTimestamp;
      return sent.edit(
        `🏓 **Pong!**\n• Message latency: **${latency}ms**\n• API latency: **${Math.round(client.ws.ping)}ms**`
      );
    }
    
      // رابط دعوة البوت
 if (command === 'botinvite') {
  const invite = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=274877990912&scope=bot`;

  return message.reply(`🔗 **Invite the bot:**\n${invite}`);
}

    // إحصائيات البوت العامة
    else if (command === 'botstats') {
  if (!isOwner) return;

  let totalMembers = 0;
  client.guilds.cache.forEach(g => totalMembers += g.memberCount);

  const embed = new EmbedBuilder()
    .setTitle('🤖 Bot Stats')
    .setColor('#5865F2')
    .addFields(
      { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      { name: 'Members', value: `${totalMembers}`, inline: true },
      { name: 'Active Giveaways', value: `${Object.keys(store.giveaways).length}`, inline: true },
      { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
      { name: 'Uptime', value: `${Math.floor(process.uptime() / 60)} min`, inline: true }
    );

  return message.reply({ embeds: [embed] });
}

    // Uptime
    else if (command === 'botuptime') {
      if (!isOwner) return;

      const ms = process.uptime() * 1000;
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);

      return message.reply(`⏱️ **Uptime:** ${d}d ${h}h ${m}m`);
    }

    // Memory usage
    else if (command === 'botmemory') {
      if (!isOwner) return;

      const used = process.memoryUsage().rss / 1024 / 1024;
      const total = os.totalmem() / 1024 / 1024;

      return message.reply(`🧠 **Memory:** ${used.toFixed(1)} MB / ${total.toFixed(0)} MB`);
    }

    // عدد القيفاويات النشطة
    else if (command === 'botactivegiveaways') {
      if (!isOwner) return;
      return message.reply(`🎉 **Active Giveaways:** ${Object.keys(store.giveaways).length}`);
    }

    // إحصائيات الترحيب للسيرفر الحالي
    else if (command === 'botgreetstats') {
      if (!isOwner) return;

      const s = store.greetSettings[message.guild.id];
      if (!s) return message.reply('👋 No greet settings for this server.');

      const channels = s.channels?.length
        ? s.channels.map(id => `<#${id}>`).join(', ')
        : 'No channels';

      return message.reply(
        `👋 **Greet Settings**\n• Channels: ${channels}\n• Message: ${s.message}\n• Auto-delete: ${s.delete_time || 'Off'}`
      );
    }

    // حالة البوت الصحية
else if (command === 'bothealth') {
  if (!isOwner) return;

  const apiPing = Math.round(client.ws.ping);
  const discordStatus = apiPing < 200 ? '🟢 Good' : apiPing < 400 ? '🟡 Slow' : '🔴 Bad';

  let dbStatus = '🟢 Connected';
  try {
    const { error } = await supabase.from('giveaways').select('id').limit(1);
    if (error) throw error;
  } catch (err) {
    logError(err);
    dbStatus = '🔴 Error';
  }

  const upMin = Math.floor(process.uptime() / 60);

  return message.reply(
    `🩺 **Bot Health**\n` +
    `• Discord API: ${discordStatus} (${apiPing}ms)\n` +
    `• Supabase: ${dbStatus}\n` +
    `• Uptime: ${upMin} min`
  );
}

    // عرض آخر الأخطاء المسجلة
else if (command === 'boterrors') {
  if (!isOwner) return;

  const errors = getErrors();
  if (errors.length === 0) return message.reply('✅ No recent errors recorded.');

  const lines = errors.map((e, i) => {
    const time = e.time.toLocaleString();
    const msg = e.message.length > 250 ? e.message.slice(0, 250) + '…' : e.message;
    return `${i + 1}. **${time}**\n\`${msg.replace(/`/g, "'")}\``;
  });

  return message.reply(`🚨 **Last ${errors.length} Errors**\n` + lines.join('\n\n'));
}

    // =========================
    // ✅ NORMAL BOT COMMANDS
    // =========================

    // gstart
    if (command === 'gstart') {
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

      store.giveaways[giveawayId] = {
        id: giveawayId,
        messageId: giveawayMessage.id,
        channelId: message.channel.id,
        guildId: message.guild.id,
        host: message.author.username,
        hostId: message.author.id,
        prize,
        winners: winnersCount,
        endtime: endTime,
        participants: [],
      };

      await saveGiveaway(store.giveaways[giveawayId]);
    }

    // help
    else if (command === 'help') {
      const helpEmbed = new EmbedBuilder()
        .setTitle('🎉 Giveaway Bot - Commands')
        .setColor('#FF0000')
        .setDescription('All available giveaway bot commands:')
        .addFields(
          { name: '🚀 !gstart `<time>` `<winners_count>` `<prize>`', value: 'Start a new giveaway' },
          { name: '🗑️ !gend `<message_id>`', value: 'End a giveaway manually' },
          { name: '📋 !glist', value: 'Show list of active giveaways' },
          { name: '🔄 !greroll `<message_id>`', value: 'Reroll winners for a giveaway' },
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
\nVariables: {mention}, {username}`,
          }
        );

      message.reply({ embeds: [helpEmbed] });
    }

    // gend
    else if (command === 'gend') {
      if (!message.member.permissions.has('ManageEvents')) return message.reply('❌ Permission needed');
      if (args.length === 0) return message.reply('❌ Usage: `!gend <message_id>`');

      const messageId = args[0];
      const giveawayId = Object.keys(store.giveaways).find((id) => store.giveaways[id].messageId === messageId);
      if (!giveawayId) return message.reply('❌ No active giveaway found');

      await endGiveaway(client, giveawayId);
      message.reply('✅ Giveaway ended successfully!');
    }

    // glist
    else if (command === 'glist') {
      const pageSize = 10;
      const page = parseInt(args[0]) || 1;

      const active = Object.values(store.giveaways).filter((g) => g.guildId === message.guild.id);
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
          inline: false,
        });
      });

      let footerText = `Page ${page}/${totalPages}`;
      if (page < totalPages) footerText = `Next page ➡ !glist ${page + 1} | ${footerText}`;
      embed.setFooter({ text: footerText });

      message.reply({ embeds: [embed] });
    }

    // greroll
    else if (command === 'greroll') {
      if (!message.member.permissions.has('ManageEvents')) return message.reply('❌ Permission needed');
      if (args.length === 0) return message.reply('❌ Usage: `!greroll <message_id>`');

      const messageId = args[0];
      const { data, error } = await supabase.from('ended_giveaways').select('*').eq('messageId', messageId);
      if (error || !data || data.length === 0) return message.reply('❌ No ended giveaway found');

      const giveaway = data[0];
      if (giveaway.participants.length === 0) return message.reply('❌ No participants to reroll');

      const newWinners = selectWinners(giveaway.participants, giveaway.winners);
      const mentions = newWinners.map((id) => `<@${id}>`).join(', ');
      message.channel.send(`🔄 Congratulations ${mentions}! You are the new winners of **${giveaway.prize}**!`);
    }

    // greet
    else if (command === 'greet') {
      if (!message.member.permissions.has('ManageGuild')) {
        return message.reply('❌ You need Manage Server permission to use this command');
      }

      const subCommand = args[0];

      if (!store.greetSettings[message.guild.id]) {
        store.greetSettings[message.guild.id] = {
          guild_id: message.guild.id,
          channels: [],
          message: 'Welcome {mention} 🎉',
          delete_time: 0,
        };
      }

      // !greet (toggle channel)
      if (!subCommand) {
        const settings = store.greetSettings[message.guild.id];
        const channelId = message.channel.id;

        if (settings.channels.includes(channelId)) {
          settings.channels = settings.channels.filter((id) => id !== channelId);
          await saveGreetSettings(message.guild.id);
          return message.reply(`✅ Greeting channel ${message.channel} removed`);
        } else {
          settings.channels.push(channelId);
          await saveGreetSettings(message.guild.id);
          return message.reply(`✅ Greeting channel ${message.channel} added`);
        }
      }

      // !greet set <message>
      if (subCommand === 'set') {
        const customMessage = args.slice(1).join(' ');
        if (!customMessage) return message.reply('❌ Usage: `!greet set <message>`');

        store.greetSettings[message.guild.id].message = customMessage;
        await saveGreetSettings(message.guild.id);
        return message.reply('✅ Greeting message updated!');
      }

      // !greet time <duration>
      if (subCommand === 'time') {
        const timeArg = args[1];
        if (!timeArg) return message.reply('❌ Usage: `!greet time <duration>` (e.g., 5s, 10m, 1h)');

        const timeMs = parseTime(timeArg);
        if (timeMs === 0) return message.reply('❌ Invalid time! Use format like 5s, 10m, 1h, 1d');

        store.greetSettings[message.guild.id].delete_time = timeMs;
        await saveGreetSettings(message.guild.id);
        return message.reply(`✅ Greeting messages will be deleted after ${formatTimeLeft(timeMs)}`);
      }

      // !greet reset
      if (subCommand === 'reset') {
        store.greetSettings[message.guild.id].channels = [];
        await saveGreetSettings(message.guild.id);
        return message.reply('✅ All greeting channels removed');
      }

      // !greet clear
      if (subCommand === 'clear') {
        await supabase.from('greet_settings').delete().eq('guild_id', message.guild.id);
        delete store.greetSettings[message.guild.id];
        return message.reply('✅ All greeting settings cleared');
      }

      // !greet test
      if (subCommand === 'test') {
        const settings = store.greetSettings[message.guild.id];
        if (!settings || !settings.channels || settings.channels.length === 0) {
          return message.reply('❌ No greeting channels set up');
        }

        const testMessage = settings.message
          .replace(/{mention}/g, `<@${message.author.id}>`)
          .replace(/{username}/g, message.author.username);

        let sentCount = 0;
        for (const channelId of settings.channels) {
          const channel = message.guild.channels.cache.get(channelId);
          if (!channel) continue;

          try {
            const sentMessage = await channel.send(testMessage);
            scheduleGreetMessageDeletion(sentMessage, settings.delete_time);
            sentCount++;
          } catch (error) {
            console.error('Error sending test message:', error);
          }
        }

        return message.reply(`✅ Test greeting sent to ${sentCount} channel(s)!`);
      }

      // !greet stats
      if (subCommand === 'stats') {
        const settings = store.greetSettings[message.guild.id];
        const embed = new EmbedBuilder().setTitle('👋 Greeting Settings').setColor('#00ff00');

        if (!settings || !settings.channels || settings.channels.length === 0) {
          embed.addFields({ name: 'Channels', value: 'No channels' });
        } else {
          const validChannels = settings.channels
            .map((id) => message.guild.channels.cache.get(id))
            .filter(Boolean)
            .map((ch) => `<#${ch.id}>`)
            .join(', ') || 'No valid channels';

          embed.addFields({ name: 'Channels', value: validChannels });
        }

        embed.addFields(
          { name: 'Message', value: settings?.message || 'Welcome {mention} 🎉' },
          {
            name: 'Delete Time',
            value: settings?.delete_time > 0 ? formatTimeLeft(settings.delete_time) : 'No auto-delete',
          }
        );

        return message.reply({ embeds: [embed] });
      }
    }
  });
}

module.exports = { registerMessageCreate };