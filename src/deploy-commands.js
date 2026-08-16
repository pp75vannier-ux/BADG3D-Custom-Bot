require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];

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
    if (command.data) commands.push(command.data.toJSON());
  }
}

loadCommands(path.join(__dirname, "commands"));

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Déploiement de ${commands.length} commande(s)...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("✅ Commandes déployées.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
