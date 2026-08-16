module.exports = {
  // IDs principaux
  guildId: process.env.GUILD_ID,

  welcome: {
    enabled: true,
    channelId: "1538240206585593897",
    autoRoleId: "1538241650365825035",
    color: 0x5865F2,
    title: "👋 Bienvenue !",
    description: "Bienvenue {user} sur **{server}** !\nTu es notre **{count}e membre**.",
    footer: "Merci de respecter le règlement."
  },

  tickets: {
    enabled: true,

    // Configuration du panel
    panel: {
      color: 0x5865F2,
      title: "🎫 Centre de support",
      description: "Bienvenue dans notre centre de support !\n\nSélectionne ci-dessous le type de demande que tu souhaites ouvrir.",
      footer: "Choisis le service correspondant à ta demande."
    },

    // Catégories des tickets
    types: [
      {
        id: "support",
        label: "Support",
        description: "Besoin d'aide ou problème",
        emoji: "🎫",
        categoryId: "1538580021952782376",
        staffRoleId: "1538241537769472111",
        color: 0x5865F2
      },

      {
        id: "commande",
        label: "Commande",
        description: "C'est ici que vous passez commande",
        emoji: "📦",
        categoryId: "1538580183941124198",
        staffRoleId: "1538241537769472111",
        color: 0x57F287
      },

      {
        id: "partenariat",
        label: "Partenariat",
        description: "Demande de partenariat",
        emoji: "🤝",
        categoryId: "1538580371208413255",
        staffRoleId: "1538241537769472111",
        color: 0xFEE75C
      },

      {
        id: "signalement / bug",
        label: "Signalement / Bug",
        description: "Signaler un membre ou un problème",
        emoji: "🛑",
        categoryId: "1538580537482940486",
        staffRoleId: "1538241537769472111",
        color: 0xED4245
      }
    ],

    logChannelId: "1538241346928644206"
  },

  moderation: {
    logChannelId: "1538241346928644206",
    warnFile: "./data/warnings.json"
  },

  colors: {
    success: 0x57F287,
    error: 0xED4245,
    info: 0x5865F2,
    warning: 0xFEE75C
  }
};