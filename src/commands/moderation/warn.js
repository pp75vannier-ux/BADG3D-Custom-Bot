const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");
const config = require("../../config");
const warnings = require("../../utils/warnings");
const { sendLog } = require("../../utils/log");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Avertit un membre.")
    .addUserOption(o => o.setName("user").setDescription("Membre").setRequired(true))
    .addStringOption(o => o.setName("raison").setDescription("Raison").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("raison");
    const list = warnings.add(interaction.guild.id, user.id, reason, interaction.user.id);

    await sendLog(
      interaction.guild,
      "⚠️ Avertissement",
      `**Membre :** ${user.tag}\n**Modérateur :** ${interaction.user.tag}\n**Raison :** ${reason}\n**Total :** ${list.length}`,
      config.colors.warning
    );

    await interaction.reply({
      content: `⚠️ ${user.tag} a reçu un avertissement. Total : ${list.length}.`,
      ephemeral: true
    });
  }
};
