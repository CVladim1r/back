import { Markup, Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const WEB_APP_URL = "https://669a2ce1de7b10000855a355--durak-teniti.netlify.app/";

bot.start((ctx) => {
    ctx.reply("Привет! Нажми на кнопку, чтобы запустить Mini App:", 
        Markup.inlineKeyboard([
            Markup.button.webApp("Launch", WEB_APP_URL)
        ])
    );
});

bot.command("inlinekb", (ctx) => {
    ctx.reply("Запускаем Mini App из инлайн-клавиатуры:", 
        Markup.inlineKeyboard([
            Markup.button.webApp("Launch", WEB_APP_URL)
        ])
    );
});

bot.on("webAppData", async (ctx) => {
    const data = JSON.parse(ctx.webAppData.data);
    const userId = ctx.from.id;
    const username = ctx.from.username;

    console.log("Received data from Mini App:");
    console.log("User ID:", userId);
    console.log("Username:", username);
    console.log("Data:", data);


    await ctx.reply("Данные успешно получены от Mini App!");
});

// Запуск бота
bot.launch().then(() => {
    console.log("Бот успешно запущен");
}).catch((err) => {
    console.error("Ошибка при запуске бота:", err);
});