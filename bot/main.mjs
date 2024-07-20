import { Markup, Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const WEB_APP_URL = "https://669a2ce1de7b10000855a355--durak-teniti.netlify.app/";

bot.start((ctx) => {
    ctx.reply(
        `👋 Привет, ${ctx.from.first_name}!\n\n` +
        `Я помогу тебе запустить игру Дурак Онлайн. Нажмите на кнопку ниже, чтобы открыть Mini App и начать играть:\n\n` +
        `🌐 *Durak Online:* [Запустить приложение](${WEB_APP_URL})`,
        Markup.inlineKeyboard([
            Markup.button.webApp("Открыть", WEB_APP_URL)
        ])
        .resize()
    );
});

bot.command("inlinekb", (ctx) => {
    ctx.reply(
        `👋 Привет, ${ctx.from.first_name}!\n\n` +
        `Я помогу тебе запустить игру Дурак Онлайн. Нажмите на кнопку ниже, чтобы открыть Mini App и начать играть:\n\n` +
        `🌐 *Durak Online:* [Запустить приложение](${WEB_APP_URL})`,
        Markup.inlineKeyboard([
            Markup.button.webApp("Открыть", WEB_APP_URL)
        ])
        .resize()
    );
});


bot.on("webAppData", async (ctx) => {
    try {
        const data = JSON.parse(ctx.webAppData.data);
        const userId = ctx.from.id;
        const username = ctx.from.username;

        console.log("Received data from Mini App:");
        console.log("User ID:", userId);
        console.log("Username:", username);
        console.log("Data:", data);

        await ctx.reply(
            `📥 Данные успешно получены от Mini App!\n\n` +
            `*User ID:* ${userId}\n` +
            `*Username:* @${username}\n` +
            `*Data:* ${JSON.stringify(data, null, 2)}`,
            { parse_mode: 'MarkdownV2' }
        );
    } catch (error) {
        console.error("Error processing webAppData:", error);
        await ctx.reply("❌ Произошла ошибка при получении данных от Mini App.");
    }
});

// Запуск бота
bot.launch().then(() => {
    console.log("Бот успешно запущен");
}).catch((err) => {
    console.error("Ошибка при запуске бота:", err);
});