const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");
const config = require("../../config");
const { sendLog } = require("../../utils/log");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bannit un membre.")
    .addUserOption(o => o.setName("user").setDescription("Membre").setRequired(true))
    .addStringOption(o => o.setName("raison").setDescription("Raison").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("raison") || "Aucune raison indiquée.";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (member && !member.bannable) {
      return interaction.reply({ content: "❌ Je ne peux pas bannir ce membre.", ephemeral: true });
    }

    await interaction.guild.members.ban(user.id, { reason });

    await sendLog(
      interaction.guild,
      "🔨 Bannissement",
      `**Membre :** ${user.tag}\n**Modérateur :** ${interaction.user.tag}\n**Raison :** ${reason}`,
      config.colors.error
    );

    await interaction.reply({ content: `🔨 ${user.tag} a été banni.`, ephemeral: true });
  }
};
