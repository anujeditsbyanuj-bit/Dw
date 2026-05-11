require("dotenv").config();
const { Telegraf } = require("telegraf");
const { chromium } = require("playwright");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("👋 Send Diskwala link"));

bot.on("text", async (ctx) => {
  const link = ctx.message.text;

  if (!link.includes("diskwala.com/app")) {
    return ctx.reply("❌ Invalid link");
  }

  const msg = await ctx.reply("⏳ Processing...");

  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    let video = null;

    page.on("response", (res) => {
      const url = res.url();
      if (url.includes(".mp4") || url.includes(".m3u8")) {
        video = url;
      }
    });

    await page.goto(link, { timeout: 60000 });
    await page.waitForTimeout(8000);

    await browser.close();

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
    if (browser) await browser.close();
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msg.message_id,
      null,
      "❌ Error"
    );
  }
});

bot.launch();
