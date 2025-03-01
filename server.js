from flask import Flask, request
import threading
import discord
from discord.ext import commands

# Flask uygulamasını oluştur
app = Flask(__name__)

# Discord botunu oluştur
intents = discord.Intents.default()
intents.message_content = True  # Mesaj içeriğini okumak için gerekli
bot = commands.Bot(command_prefix="/", intents=intents)

# Bot başlatıldığında çalışacak kod
@bot.event
async def on_ready():
    print(f'Bot {bot.user.name} olarak giriş yaptı!')

# /ip komutunu dinleme
@bot.command()
async def ip(ctx):
    await ctx.send('Server Yaxın Bir Vaxtda Açılacaqdır')

# /ping komutunu dinleme
@bot.command()
async def ping(ctx):
    await ctx.send('Pong!')

# Flask endpoint'i
@app.route('/')
def home():
    return "Flask ile Discord Botu Entegrasyonu"

# Flask endpoint'i ile botu başlatma
@app.route('/start-bot')
def start_bot():
    # Botu ayrı bir thread'de başlat
    bot_thread = threading.Thread(target=bot.run, args=("YOUR_BOT_TOKEN",))
    bot_thread.start()
    return "Bot başlatıldı!"

# Flask uygulamasını çalıştır
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
