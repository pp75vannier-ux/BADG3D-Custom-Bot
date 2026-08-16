const { PermissionFlagsBits } = require("discord.js");

function isStaff(member, roleId) {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    (roleId && member.roles.cache.has(roleId))
  );
}

module.exports = { isStaff };
