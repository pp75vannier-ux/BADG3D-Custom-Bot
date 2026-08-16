const { EmbedBuilder } = require("discord.js");
const config = require("../config");

async function sendLog(guild, title, description, color = config.colors.info) {
  const channelId = config.moderation.logChannelId || config.tickets.logChannelId;
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId);
  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { sendLog };
