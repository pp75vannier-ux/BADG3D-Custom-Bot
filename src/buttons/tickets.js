const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const config = require("../config");
const { isStaff } = require("../utils/permissions");
const { sendLog } = require("../utils/log");

// ======================================================
// UTILITAIRES
// ======================================================

function getTicketType(typeId) {
  return config.tickets.types.find(type => type.id === typeId);
}

function isTicketChannel(channel) {
  return (
    channel &&
    channel.type === ChannelType.GuildText &&
    channel.name.startsWith("ticket-")
  );
}

function getTicketData(channel) {
  const topic = channel.topic || "";

  const ownerId =
    topic.match(/ticketOwner=(\d+)/)?.[1];

  const typeId =
    topic.match(/ticketType=([^;]+)/)?.[1];

  const username =
    topic.match(/ticketUsername=([^;]+)/)?.[1];

  return {
    ownerId,
    typeId,
    username
  };
}

// ======================================================
// NOM DU TICKET
// ======================================================

function cleanUsername(username) {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 20) || "utilisateur";
}

function getTicketName(type, username) {
  return `ticket-${type.id}-${cleanUsername(username)}`;
}

// ======================================================
// RECHERCHE TICKET EXISTANT
// ======================================================

async function findExistingTicket(guild, userId) {
  return guild.channels.cache.find(channel => {
    if (!isTicketChannel(channel)) {
      return false;
    }

    const { ownerId } = getTicketData(channel);

    return ownerId === userId;
  });
}

// ======================================================
// BOUTONS DU TICKET
// ======================================================

function ticketButtons() {
  return new ActionRowBuilder().addComponents(

    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("Fermer")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("ticket_reopen")
      .setLabel("Rouvrir")
      .setEmoji("🔓")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("ticket_transcript")
      .setLabel("Transcription")
      .setEmoji("📋")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("ticket_delete")
      .setLabel("Supprimer")
      .setEmoji("🗑️")
      .setStyle(ButtonStyle.Danger)

  );
}

// ======================================================
// CREATION DU TICKET
// ======================================================

async function createTicket(interaction, typeId) {

  const type = getTicketType(typeId);

  if (!type) {
    return interaction.reply({
      content: "❌ Ce type de ticket n'existe pas.",
      flags: 64
    });
  }

  // ----------------------------------------------------
  // Vérification de la catégorie
  // ----------------------------------------------------

  const category =
    interaction.guild.channels.cache.get(
      type.categoryId
    );

  if (!category) {
    return interaction.reply({
      content:
        `❌ La catégorie du ticket **${type.label}** est introuvable.\n\n` +
        `ID configuré : \`${type.categoryId}\``,
      flags: 64
    });
  }

  if (category.type !== ChannelType.GuildCategory) {
    return interaction.reply({
      content:
        `❌ L'ID configuré pour **${type.label}** n'est pas une catégorie Discord.`,
      flags: 64
    });
  }

  // ----------------------------------------------------
  // Vérification ticket déjà ouvert
  // ----------------------------------------------------

  const existingTicket =
    await findExistingTicket(
      interaction.guild,
      interaction.user.id
    );

  if (existingTicket) {
    return interaction.reply({
      content:
        `❌ Tu as déjà un ticket ouvert : ${existingTicket}`,
      flags: 64
    });
  }

  // ----------------------------------------------------
  // Nettoyage du pseudo
  // ----------------------------------------------------

  const username =
    cleanUsername(
      interaction.user.username
    );

  // ----------------------------------------------------
  // Permissions
  // ----------------------------------------------------

  const permissionOverwrites = [

    {
      id: interaction.guild.roles.everyone.id,

      deny: [
        PermissionFlagsBits.ViewChannel
      ]
    },

    {
      id: interaction.user.id,

      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles
      ]
    }

  ];

  // ----------------------------------------------------
  // Permissions Staff
  // ----------------------------------------------------

  if (
    type.staffRoleId &&
    !type.staffRoleId.startsWith("ID_")
  ) {

    permissionOverwrites.push({

      id: type.staffRoleId,

      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ManageChannels
      ]

    });
  }

  // ----------------------------------------------------
  // Création du salon
  // ----------------------------------------------------

  const channel =
    await interaction.guild.channels.create({

      name:
        getTicketName(
          type,
          username
        ),

      type:
        ChannelType.GuildText,

      parent:
        category.id,

      // On garde l'ID Discord du propriétaire
      // pour les permissions et la détection du ticket.
      topic:
        `ticketOwner=${interaction.user.id};` +
        `ticketType=${type.id};` +
        `ticketUsername=${username}`,

      permissionOverwrites

    });

  // ----------------------------------------------------
  // Mention Staff
  // ----------------------------------------------------

  let staffMention = "";

  if (
    type.staffRoleId &&
    !type.staffRoleId.startsWith("ID_")
  ) {

    staffMention =
      ` <@&${type.staffRoleId}>`;
  }

  // ----------------------------------------------------
  // Embed du ticket
  // ----------------------------------------------------

  const embed =
    new EmbedBuilder()

      .setColor(
        type.color ||
        config.colors.info
      )

      .setTitle(
        type.welcomeTitle ||
        `${type.emoji || "🎫"} Ticket ${type.label}`
      )

      .setDescription(

        `Bonjour ${interaction.user} !\n\n` +

        `${type.welcomeMessage ||
          "Explique ta demande avec le plus de détails possible."
        }\n\n` +

        `**Type :** ` +
        `${type.emoji || "🎫"} ${type.label}\n\n` +

        `Utilise les boutons ci-dessous ` +
        `pour gérer ton ticket.`

      )

      .setFooter({
        text:
          `Ticket de ${interaction.user.tag}`
      })

      .setTimestamp();

  // ----------------------------------------------------
  // Message dans le ticket
  // ----------------------------------------------------

  await channel.send({

    content:
      `<@${interaction.user.id}>${staffMention}`,

    embeds: [
      embed
    ],

    components: [
      ticketButtons()
    ]

  });

  // ----------------------------------------------------
  // Logs
  // ----------------------------------------------------

  await sendLog(

    interaction.guild,

    "🎫 Ticket créé",

    `**Ticket :** ${channel}\n` +
    `**Type :** ${type.emoji || "🎫"} ${type.label}\n` +
    `**Créateur :** ${interaction.user.tag}\n` +
    `**Catégorie :** ${category.name}`,

    config.colors.success

  );

  // ----------------------------------------------------
  // Réponse
  // ----------------------------------------------------

  await interaction.reply({

    content:
      `✅ Ton ticket **${type.label}** a été créé : ${channel}`,

    flags: 64

  });
}

// ======================================================
// FERMER LE TICKET
// ======================================================

async function closeTicket(interaction) {

  if (
    !isTicketChannel(
      interaction.channel
    )
  ) {

    return interaction.reply({
      content:
        "❌ Cette action est uniquement disponible dans un ticket.",
      flags: 64
    });
  }

  const {
    ownerId,
    typeId
  } =
    getTicketData(
      interaction.channel
    );

  const type =
    getTicketType(typeId);

  if (
    !isStaff(
      interaction.member,
      type?.staffRoleId
    )
  ) {

    return interaction.reply({
      content:
        "❌ Tu n'as pas la permission.",
      flags: 64
    });
  }

  // Retirer l'accès au propriétaire
  if (ownerId) {

    await interaction.channel
      .permissionOverwrites
      .edit(

        ownerId,

        {
          ViewChannel: false,
          SendMessages: false
        }

      )
      .catch(() => {});
  }

  // Ajouter "closed-"
  await interaction.channel
    .setName(
      `closed-${interaction.channel.name}`
    )
    .catch(() => {});

  await interaction.reply({

    content:
      "🔒 Ticket fermé.",

    flags: 64

  });
}

// ======================================================
// ROUVRIR LE TICKET
// ======================================================

async function reopenTicket(interaction) {

  if (
    !interaction.channel.name.startsWith(
      "closed-ticket-"
    )
  ) {

    return interaction.reply({
      content:
        "❌ Ce ticket n'est pas fermé.",
      flags: 64
    });
  }

  const {
    ownerId,
    typeId,
    username
  } =
    getTicketData(
      interaction.channel
    );

  const type =
    getTicketType(typeId);

  if (
    !isStaff(
      interaction.member,
      type?.staffRoleId
    )
  ) {

    return interaction.reply({
      content:
        "❌ Tu n'as pas la permission.",
      flags: 64
    });
  }

  // Redonner accès au propriétaire
  if (ownerId) {

    await interaction.channel
      .permissionOverwrites
      .edit(

        ownerId,

        {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        }

      )
      .catch(() => {});
  }

  // Récupérer le nom sauvegardé
  const ticketUsername =
    username || "utilisateur";

  // Renommer correctement
  await interaction.channel
    .setName(
      `ticket-${typeId}-${ticketUsername}`
    )
    .catch(() => {});

  await interaction.reply({

    content:
      "🔓 Ticket rouvert.",

    flags: 64

  });
}

// ======================================================
// TRANSCRIPTION
// ======================================================

async function transcript(interaction) {

  if (
    !isTicketChannel(
      interaction.channel
    )
  ) {

    return interaction.reply({
      content:
        "❌ Cette action est uniquement disponible dans un ticket.",
      flags: 64
    });
  }

  const {
    typeId
  } =
    getTicketData(
      interaction.channel
    );

  const type =
    getTicketType(typeId);

  if (
    !isStaff(
      interaction.member,
      type?.staffRoleId
    )
  ) {

    return interaction.reply({
      content:
        "❌ Tu n'as pas la permission.",
      flags: 64
    });
  }

  await interaction.deferReply({
    flags: 64
  });

  // ----------------------------------------------------
  // Récupération des messages
  // ----------------------------------------------------

  const messages = [];

  let lastId;

  for (
    let i = 0;
    i < 10;
    i++
  ) {

    const fetched =
      await interaction.channel
        .messages
        .fetch({

          limit: 100,

          ...(lastId
            ? {
                before: lastId
              }
            : {})

        });

    if (!fetched.size) {
      break;
    }

    messages.push(
      ...fetched.values()
    );

    lastId =
      fetched.last().id;

    if (
      fetched.size < 100
    ) {
      break;
    }
  }

  messages.reverse();

  // ----------------------------------------------------
  // Protection HTML
  // ----------------------------------------------------

  const escape =
    value =>
      String(value)
        .replaceAll(
          "&",
          "&amp;"
        )
        .replaceAll(
          "<",
          "&lt;"
        )
        .replaceAll(
          ">",
          "&gt;"
        )
        .replaceAll(
          '"',
          "&quot;"
        );

  // ----------------------------------------------------
  // HTML
  // ----------------------------------------------------

  const html = `<!DOCTYPE html>

<html lang="fr">

<head>

<meta charset="UTF-8">

<title>
Transcription ${escape(
  interaction.channel.name
)}
</title>

<style>

body {
  font-family: Arial, sans-serif;
  background: #111;
  color: #eee;
  padding: 25px;
}

.message {
  padding: 12px 0;
  border-bottom: 1px solid #333;
}

.author {
  font-weight: bold;
}

.date {
  color: #888;
  font-size: 12px;
}

.content {
  margin-top: 5px;
  white-space: pre-wrap;
}

</style>

</head>

<body>

<h1>
Transcription —
${escape(
  interaction.channel.name
)}
</h1>

${messages
  .map(message => `

<div class="message">

<div class="author">

${escape(
  message.author.tag
)}

<span class="date">

${escape(
  message.createdAt
    .toLocaleString("fr-FR")
)}

</span>

</div>

<div class="content">

${escape(
  message.content ||
  "[Contenu non textuel]"
)}

</div>

</div>

`)
  .join("")}

</body>

</html>`;

  // ----------------------------------------------------
  // Fichier
  // ----------------------------------------------------

  const fileName =
    `${interaction.channel.name}-${Date.now()}.html`;

  const buffer =
    Buffer.from(
      html,
      "utf8"
    );

  // ----------------------------------------------------
  // Salon logs
  // ----------------------------------------------------

  const logChannel =
    interaction.guild.channels.cache.get(
      config.tickets.logChannelId
    );

  if (
    logChannel &&
    logChannel.isTextBased()
  ) {

    await logChannel.send({

      content:
        `📋 Transcription de **${interaction.channel.name}** ` +
        `par ${interaction.user.tag}`,

      files: [
        {
          attachment:
            buffer,

          name:
            fileName
        }
      ]

    }).catch(() => {});
  }

  await interaction.editReply({

    content:
      "✅ Transcription générée et envoyée dans les logs."

  });
}

// ======================================================
// SUPPRIMER LE TICKET
// ======================================================

async function deleteTicket(interaction) {

  if (
    !isTicketChannel(
      interaction.channel
    )
  ) {

    return interaction.reply({
      content:
        "❌ Cette action est uniquement disponible dans un ticket.",
      flags: 64
    });
  }

  const {
    typeId
  } =
    getTicketData(
      interaction.channel
    );

  const type =
    getTicketType(typeId);

  if (
    !isStaff(
      interaction.member,
      type?.staffRoleId
    )
  ) {

    return interaction.reply({
      content:
        "❌ Tu n'as pas la permission.",
      flags: 64
    });
  }

  await interaction.reply({

    content:
      "🗑️ Suppression du ticket...",

    flags: 64

  });

  // Logs avant suppression
  await sendLog(

    interaction.guild,

    "🗑️ Ticket supprimé",

    `**Salon :** ${interaction.channel.name}\n` +
    `**Type :** ${type?.label || "Inconnu"}\n` +
    `**Par :** ${interaction.user.tag}`,

    config.colors.error

  );

  // Suppression
  setTimeout(() => {

    interaction.channel
      .delete(
        "Ticket supprimé"
      )
      .catch(() => {});

  }, 1500);
}

// ======================================================
// GESTION DES INTERACTIONS
// ======================================================

module.exports =
  async function handleTicket(
    interaction,
    client
  ) {

    // --------------------------------------------------
    // MENU DE SELECTION
    // --------------------------------------------------

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId ===
        "ticket_type_select"
    ) {

      const typeId =
        interaction.values[0];

      console.log(
        `🎫 Création ticket : ${typeId}`
      );

      return createTicket(
        interaction,
        typeId
      );
    }

    // --------------------------------------------------
    // BOUTONS
    // --------------------------------------------------

    if (
      interaction.isButton()
    ) {

      switch (
        interaction.customId
      ) {

        case "ticket_close":

          return closeTicket(
            interaction
          );

        case "ticket_reopen":

          return reopenTicket(
            interaction
          );

        case "ticket_transcript":

          return transcript(
            interaction
          );

        case "ticket_delete":

          return deleteTicket(
            interaction
          );

        default:

          return;
      }
    }
  };