// utils/greeting.js

// حذف رسالة الترحيب بعد وقت محدد
function scheduleGreetMessageDeletion(message, deleteTime) {
  if (deleteTime > 0) {
    setTimeout(async () => {
      try {
        await message.delete();
      } catch (error) {
        console.error('Error deleting greet message:', error);
      }
    }, deleteTime);
  }
}

// رسالة ترحيب عند دخول عضو
async function handleMemberAdd(member) {
  const settings = global.greetSettings[member.guild.id];
  if (!settings || !settings.channels || settings.channels.length === 0 || !settings.message) return;

  const welcomeMessage = settings.message
    .replace(/{mention}/g, `<@${member.id}>`)
    .replace(/{username}/g, member.user.username);

  // إرسال رسالة الترحيب لكل القنوات المحددة
  for (const channelId of settings.channels) {
    const channel = member.guild.channels.cache.get(channelId);
    if (channel) {
      try {
        const sentMessage = await channel.send(welcomeMessage);
        // جدولة حذف الرسالة إذا كان هناك وقت محدد
        scheduleGreetMessageDeletion(sentMessage, settings.delete_time);
      } catch (error) {
        console.error('Error sending greet message:', error);
      }
    }
  }
}

module.exports = {
  scheduleGreetMessageDeletion,
  handleMemberAdd
};