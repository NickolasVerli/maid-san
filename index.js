require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// ================= CONFIG =================
const CANAL_GOLPISTAS_ID = "1464272936813727826"; //
const CANAL_LOGS_ID = "1439262197137145966";
const CARGOS_PERMITIDOS = [
  "557374227037290497", //hayate
  "557374227708379186", // Admin
  "686765648193257474", // Moderador
  "574235429319081984", //staff
  "557374228832452626", //BOTS
];

const LIMITE_14_DIAS = 14 * 24 * 60 * 60 * 1000;
// =========================================

// BOT ONLINE
client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

async function enviarLog(guild, conteudo) {
  const canalLogs = guild.channels.cache.get(CANAL_LOGS_ID);
  if (!canalLogs) return;

  canalLogs.send({ content: conteudo }).catch(() => {});
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CANAL_GOLPISTAS_ID) return;

  const member = message.member;
  if (!member) return;

  // Bypass por cargo
  const temPermissao = member.roles.cache.some((role) =>
    CARGOS_PERMITIDOS.includes(role.id),
  );
  if (temPermissao) return;

  // Proteção extra
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  try {
    // 1️⃣ BAN
    await member.ban({
      reason: "Golpe / mensagem em canal de segurança",
    });

    await enviarLog(
      message.guild,
      [
        "🚨 **BANIMENTO AUTOMÁTICO**",
        `👤 Usuário: ${member.user.tag}`,
        `🆔 ID: ${member.id}`,
        `📍 Canal: <#${message.channel.id}>`,
        `🧹 Mensagens apagadas: ${totalApagadas}`,
        `🕒 Data: <t:${Math.floor(Date.now() / 1000)}:F>`,
        `📄 Motivo: Golpista detectado`,
      ].join("\n"),
    );

    let totalApagadas = 0;

    // 2️⃣ VARREDURA EM TODOS OS CANAIS DE TEXTO
    const canais = message.guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText && c.viewable,
    );

    for (const canal of canais.values()) {
      let lastId;

      while (true) {
        const mensagens = await canal.messages.fetch({
          limit: 100,
          before: lastId,
        });

        if (mensagens.size === 0) break;

        for (const msg of mensagens.values()) {
          const idade = Date.now() - msg.createdTimestamp;

          if (msg.author.id === member.id && idade < LIMITE_14_DIAS) {
            await msg.delete().catch(() => {});
            totalApagadas++;
          }
        }

        lastId = mensagens.last().id;
      }
    }

    console.log(
      `⛔ ${member.user.tag} | Timeout ${TIMEOUT_MINUTOS}min | 🧹 ${totalApagadas} mensagens apagadas`,
    );
  } catch (err) {
    console.error("Erro no sistema de segurança:", err);
  }
});

// LOGIN (NUNCA COLOQUE TOKEN FIXO)
client.login(process.env.BOT_TOKEN);

console.log("TOKEN CARREGADO?", !!process.env.BOT_TOKEN);
