const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");
const warnings = require("../../utils/warnings");
const config = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Affiche les avertissements d'un membre.")
    .addUserOption(o => o.setName("user").setDescription("Membre").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const list = warnings.get(interaction.guild.id, user.id);

    const description = list.length
      ? list.map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.moderatorId}> — <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>`).join("\n")
      : "Aucun avertissement.";

    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle(`⚠️ Avertissements de ${user.tag}`)
      .setDescription(description);

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};
