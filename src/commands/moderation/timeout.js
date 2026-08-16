const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");
const config = require("../../config");
const { sendLog } = require("../../utils/log");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Met un membre en timeout.")
    .addUserOption(o => o.setName("user").setDescription("Membre").setRequired(true))
    .addIntegerOption(o =>
      o.setName("minutes")
        .setDescription("Durée en minutes")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .addStringOption(o => o.setName("raison").setDescription("Raison").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const reason = interaction.options.getString("raison") || "Aucune raison indiquée.";
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member || !member.moderatable) {
      return interaction.reply({ content: "❌ Je ne peux pas timeout ce membre.", ephemeral: true });
    }

    await member.timeout(minutes * 60 * 1000, reason);

    await sendLog(
      interaction.guild,
      "🔇 Timeout",
      `**Membre :** ${user.tag}\n**Durée :** ${minutes} min\n**Modérateur :** ${interaction.user.tag}\n**Raison :** ${reason}`,
      config.colors.warning
    );

    await interaction.reply({
      content: `🔇 ${user.tag} est en timeout pendant ${minutes} minute(s).`,
      ephemeral: true
    });
  }
};
