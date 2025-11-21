// utils/reactions.js
const { saveGiveaway } = require('./database');

// معالجة إضافة تفاعل
async function handleReactionAdd(reaction, user) {
  if (user.bot || reaction.emoji.name !== '🎉') return;
  const giveawayId = Object.keys(global.giveaways).find(id => global.giveaways[id].messageId === reaction.message.id);
  if (!giveawayId) return;

  const giveaway = global.giveaways[giveawayId];
  if (!giveaway.participants.includes(user.id)) {
    giveaway.participants.push(user.id);
    await saveGiveaway(giveaway);
  }
}

// معالجة إزالة تفاعل
async function handleReactionRemove(reaction, user) {
  if (user.bot || reaction.emoji.name !== '🎉') return;
  const giveawayId = Object.keys(global.giveaways).find(id => global.giveaways[id].messageId === reaction.message.id);
  if (!giveawayId) return;

  const giveaway = global.giveaways[giveawayId];
  giveaway.participants = giveaway.participants.filter(id => id !== user.id);
  await saveGiveaway(giveaway);
}

module.exports = {
  handleReactionAdd,
  handleReactionRemove
};