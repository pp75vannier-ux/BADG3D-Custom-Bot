const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");
const warnings = require("../../utils/warnings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarn")
    .setDescription("Supprime les avertissements d'un membre.")
    .addUserOption(o => o.setName("user").setDescription("Membre").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    warnings.clear(interaction.guild.id, user.id);

    await interaction.reply({
      content: `✅ Les avertissements de ${user.tag} ont été supprimés.`,
      ephemeral: true
    });
  }
};
