const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");
const config = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Supprime des messages.")
    .addIntegerOption(o =>
      o.setName("amount")
        .setDescription("Nombre de messages (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    const deleted = await interaction.channel.bulkDelete(amount, true);

    await interaction.reply({
      content: `🧹 ${deleted.size} message(s) supprimé(s).`,
      ephemeral: true
    });

    setTimeout(() => interaction.deleteReply().catch(() => {}), 4000);
  }
};
