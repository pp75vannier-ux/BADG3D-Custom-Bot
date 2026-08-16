require("dotenv").config();
const http = require("http");

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain"
  });

  res.end("BADG3D Custom Bot is online!");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Serveur HTTP lancé sur le port ${PORT}`);
});
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const config = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.User, Partials.Message]
});

client.commands = new Collection();

function loadCommands(dir) {
  if (!fs.existsSync(dir)) return;

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommands(fullPath);
      continue;
    }

    if (!file.endsWith(".js")) continue;

    const command = require(fullPath);
    if (!command.data || !command.execute) {
      console.warn(`Commande ignorée: ${fullPath}`);
      continue;
    }

    client.commands.set(command.data.name, command);
  }
}

loadCommands(path.join(__dirname, "commands"));

const eventFiles = fs.readdirSync(path.join(__dirname, "events"));
for (const file of eventFiles) {
  if (!file.endsWith(".js")) continue;
  const event = require(path.join(__dirname, "events", file));

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction, client);
      return;
    }

    if (interaction.isButton() || interaction.isStringSelectMenu()) {
      const ticketHandler = require("./buttons/tickets");
      await ticketHandler(interaction, client);
    }
  } catch (error) {
    console.error("Interaction error:", error);

    const message = {
      content: "❌ Une erreur est survenue pendant l'exécution de cette action.",
      flags: 64
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(message).catch(() => {});
    } else {
      await interaction.reply(message).catch(() => {});
    }
  }
});

process.on("unhandledRejection", error => console.error("Unhandled rejection:", error));
process.on("uncaughtException", error => console.error("Uncaught exception:", error));

client.login(process.env.DISCORD_TOKEN);
