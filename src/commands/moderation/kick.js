const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");
const config = require("../../config");
const { sendLog } = require("../../utils/log");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulse un membre.")
    .addUserOption(o => o.setName("user").setDescription("Membre").setRequired(true))
    .addStringOption(o => o.setName("raison").setDescription("Raison").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("raison") || "Aucune raison indiquée.";
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member || !member.kickable) {
      return interaction.reply({ content: "❌ Je ne peux pas expulser ce membre.", ephemeral: true });
    }

    await member.kick(reason);

    await sendLog(
      interaction.guild,
      "👢 Expulsion",
      `**Membre :** ${user.tag}\n**Modérateur :** ${interaction.user.tag}\n**Raison :** ${reason}`,
      config.colors.warning
    );

    await interaction.reply({ content: `👢 ${user.tag} a été expulsé.`, ephemeral: true });
  }
};
