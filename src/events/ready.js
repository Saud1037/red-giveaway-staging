const store = require('../store');
const { loadGiveaways, endGiveaway } = require('../services/giveawayService');
const { loadGreetSettings } = require('../services/greetService');

function registerEvents(client) {
  client.once('ready', async () => {
    console.log(`Bot is ready: ${client.user.tag}`);

    await loadGiveaways();
    await loadGreetSettings();

    setInterval(() => {
      const now = Date.now();
      for (const [giveawayId, giveaway] of Object.entries(store.giveaways)) {
        if (now >= new Date(giveaway.endtime).getTime()) {
          endGiveaway(client, giveawayId);
        }
      }
    }, 5000);
  });
}

module.exports = { registerEvents };