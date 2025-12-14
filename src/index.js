require('dotenv').config();

const client = require('./client');
const { registerEvents } = require('./events/ready');
const { registerGuildMemberAdd } = require('./events/guildMemberAdd');
const { registerMessageCreate } = require('./events/messageCreate');
const { registerMessageReactionAdd } = require('./events/messageReactionAdd');
const { registerMessageReactionRemove } = require('./events/messageReactionRemove');

registerEvents(client);
registerGuildMemberAdd(client);
registerMessageCreate(client);
registerMessageReactionAdd(client);
registerMessageReactionRemove(client);

client.login(process.env.DISCORD_TOKEN);