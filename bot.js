require("dotenv").config();
const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("👋 Send Diskwala link"));

bot.on("text", async (ctx) => {
  const link = ctx.message.text;

  if (!link.includes("diskwala.com/app")) {
    return ctx.reply("❌ Invalid link");
  }

  const msg = await ctx.reply("⏳ Processing...");

  try {
    // 🔥 Flask API call
    const response = await axios.get(
      "https://yourapp.onrender.com/api?url=" + encodeURIComponent(link)
    );

    const video = response.data.url;

    if (!video) {
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        msg.message_id,
        null,
        "❌ Video not found"
      );
    }

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msg.message_id,
      null,
      "✅ Video Ready",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎬 Watch", url: video }],
            [{ text: "📥 Download", url: video }]
          ]
        }
      }
    );

  } catch (err) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msg.message_id,
      null,
      "❌ Error while fetching video"
    );
  }
});

bot.launch();
