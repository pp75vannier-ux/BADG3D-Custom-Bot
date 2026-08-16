const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");
const config = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Envoie une annonce.")
    .addStringOption(o =>
      o.setName("message")
        .setDescription("Message de l'annonce")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const message = interaction.options.getString("message");

    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle("📢 Annonce")
      .setDescription(message)
      .setFooter({ text: `Annonce par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: "✅ Annonce envoyée.", ephemeral: true });
  }
};
