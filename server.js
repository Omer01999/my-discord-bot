require('dotenv').config(); // .env dosyasını yükle
const { Client, GatewayIntentBits } = require('discord.js');

// Yeni bir bot istemcisi oluştur
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Mesaj içeriğini okumak için gerekli
  ],
});

// Bot başlatıldığında çalışacak kod
client.once('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

// /ip komutunu dinleme
client.on('messageCreate', (message) => {
  if (message.content === '/ip') {
    message.reply('Server Yaxın Bir Vaxtda Açılacaqdır');
  }
});

// Bot token'ı ile giriş yap
client.login(process.env.BOT_TOKEN);
