const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  PermissionFlagsBits
} = require("discord.js");

const config = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-ticket")
    .setDescription("Envoie le panel des tickets.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      if (!config.tickets.enabled) {
        return interaction.reply({
          content: "❌ Le système de tickets est désactivé.",
          ephemeral: true
        });
      }

      const types = config.tickets.types || [];

      if (types.length === 0) {
        return interaction.reply({
          content: "❌ Aucun type de ticket n'est configuré.",
          ephemeral: true
        });
      }

      // Création des options du menu
      const options = types.map(type => {
        return new StringSelectMenuOptionBuilder()
          .setLabel(type.label)
          .setValue(type.id)
          .setDescription(
            type.description?.substring(0, 100) ||
            `Ouvrir un ticket ${type.label}`
          )
          .setEmoji(type.emoji || "🎫");
      });

      // Création du menu
      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_type_select")
        .setPlaceholder("📂 Choisissez le type de votre ticket")
        .addOptions(options);

      const row = new ActionRowBuilder()
        .addComponents(menu);

      // Création du panel
      const embed = new EmbedBuilder()
        .setColor(config.tickets.panel.color)
        .setTitle(config.tickets.panel.title)
        .setDescription(config.tickets.panel.description)
        .setFooter({
          text: config.tickets.panel.footer
        })
        .setTimestamp();

      // Envoi du panel
      await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({
        content: "✅ Le panel de tickets a été envoyé.",
        ephemeral: true
      });

    } catch (error) {
      console.error("Erreur setup-ticket :", error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Une erreur est survenue lors de la création du panel.",
          ephemeral: true
        });
      }
    }
  }
};