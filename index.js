const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const PREFIX = '!';
let başvuruKanalı = null;
let başvurular = [];
let yetkiliRolID = null; // Başvurulara onay verecek yetkililer için kontrol rolü
let verilecekRolID = null; // Kabul edilene verilecek rol

client.once('ready', () => {
    console.log(`${client.user.tag} aktif!`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const komut = args.shift().toLowerCase();

    // Yardım komutu
    if (komut === 'yetkili-alım-yardım') {
        const embed = new EmbedBuilder()
            .setTitle('Yetkili Alım Komut Yardımı')
            .setColor('Blue')
            .addFields(
                { name: 'Üye Komutları', value: '`!yetkili-alım <isim> <yaş> <neden> <katkı>`\nYetkili başvurusu yapar.' },
                { name: 'Yetkili Komutları', value: '`!ayarla-kanal #kanal`\nBaşvuruların gideceği kanalı ayarlar.\n`!ayarla-rol @rol`\nKabul edilenlere verilecek rolü ayarlar.' }
            );
        return message.reply({ embeds: [embed] });
    }

    // Başvuru kanalı ayarlama
    if (komut === 'ayarla-kanal') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Bu komutu kullanmak için yetkiniz yok.');
        }
        const kanal = message.mentions.channels.first();
        if (!kanal) return message.reply('Bir kanal etiketlemelisiniz.');
        başvuruKanalı = kanal;
        message.reply(`Başvuru kanalı **${kanal.name}** olarak ayarlandı.`);
    }

    // Kabul edilenlere verilecek rolü ayarlama
    if (komut === 'ayarla-rol') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Bu komutu kullanmak için yetkiniz yok.');
        }
        const rol = message.mentions.roles.first();
        if (!rol) return message.reply('Bir rol etiketlemelisiniz.');
        verilecekRolID = rol.id;
        message.reply(`Kabul edilenlere verilecek rol ayarlandı: ${rol.name}`);
    }

    // Başvuru komutu
    if (komut === 'yetkili-alım') {
        if (!başvuruKanalı) return message.reply('Başvuru kanalı ayarlanmamış.');
        if (args.length < 4) {
            return message.reply('Kullanım: `!yetkili-alım <isim> <yaş> <neden> <katkı>`');
        }

        const [isim, yaş, ...nedenKatki] = args;
        const neden = nedenKatki.slice(0, Math.floor(nedenKatki.length / 2)).join(' ');
        const katkı = nedenKatki.slice(Math.floor(nedenKatki.length / 2)).join(' ');

        const embed = new EmbedBuilder()
            .setTitle('Yeni Yetkili Başvurusu')
            .addFields(
                { name: 'Kullanıcı', value: message.author.tag },
                { name: 'İsim', value: isim },
                { name: 'Yaş', value: yaş },
                { name: 'Neden Yetkili Olmak İstiyor?', value: neden },
                { name: 'Sunucuya Katkısı', value: katkı }
            )
            .setColor('Green')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('kabul_et')
                .setLabel('Kabul Et')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('reddet')
                .setLabel('Reddet')
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await başvuruKanalı.send({ embeds: [embed], components: [row] });

        başvurular.push({
            kullanıcı: message.author,
            mesajId: msg.id
        });

        message.reply('Başvurun gönderildi! Yetkililer en kısa sürede değerlendirecektir.');
    }
});

// Butonlar
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const başvuru = başvurular.find(b => b.mesajId === interaction.message.id);
    if (!başvuru) return interaction.reply({ content: 'Başvuru bulunamadı.', ephemeral: true });

    const guildMember = await interaction.guild.members.fetch(başvuru.kullanıcı.id).catch(() => null);

    if (interaction.customId === 'kabul_et') {
        if (verilecekRolID && guildMember) {
            await guildMember.roles.add(verilecekRolID).catch(() => null);
        }
        await başvuru.kullanıcı.send('Tebrikler! Başvurunuz kabul edildi ve yetkili rolünüz verildi.');
        interaction.reply({ content: `${başvuru.kullanıcı.tag} başvurusu kabul edildi.`, ephemeral: true });
    }

    if (interaction.customId === 'reddet') {
        await başvuru.kullanıcı.send('Üzgünüz, başvurunuz reddedildi.');
        interaction.reply({ content: `${başvuru.kullanıcı.tag} başvurusu reddedildi.`, ephemeral: true });
    }
});

client.login(process.env.BOT_TOKEN);