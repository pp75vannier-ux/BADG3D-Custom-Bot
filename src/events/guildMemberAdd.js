const { Events, EmbedBuilder } = require("discord.js");
const config = require("../config");
const { sendLog } = require("../utils/log");

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    if (!config.welcome.enabled) return;

    const channel = member.guild.channels.cache.get(config.welcome.channelId);

    if (config.welcome.autoRoleId) {
      const role = member.guild.roles.cache.get(config.welcome.autoRoleId);
      if (role) await member.roles.add(role).catch(() => {});
    }

    if (!channel || !channel.isTextBased()) return;

    const description = config.welcome.description
      .replaceAll("{user}", `<@${member.id}>`)
      .replaceAll("{server}", member.guild.name)
      .replaceAll("{count}", member.guild.memberCount.toString());

    const embed = new EmbedBuilder()
      .setColor(config.welcome.color)
      .setTitle(config.welcome.title)
      .setDescription(description)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: config.welcome.footer })
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => {});

    await sendLog(
      member.guild,
      "👋 Nouveau membre",
      `${member.user.tag} a rejoint le serveur.`,
      config.colors.success
    );
  }
};
