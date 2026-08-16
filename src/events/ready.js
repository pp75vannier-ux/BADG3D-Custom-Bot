const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
    console.log(`📡 ${client.guilds.cache.size} serveur(s)`);

    client.user.setPresence({
      activities: [{ name: "vos tickets 🎫", type: ActivityType.Watching }],
      status: "online"
    });
  }
};
