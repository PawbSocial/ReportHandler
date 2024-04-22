import { isValidTelegramChat } from "./constants.js";
import { SendTelegramMessage } from "./sendMessage.js";

export const TelegramHandler = async (request, env, ctx) => {
    const requestJson = await request.json();

    console.log({ requestJson });

    const message = requestJson?.message;
    const entities = message?.entities;

    if (!entities) {
        console.log("not a bot command (no_entity)");
        return;
    }

    const botCommand = entities.find(e => e.type === "bot_command" && e.offset === 0);

    if (!botCommand) {
        console.log("not a bot command (bad_entity)");
        return;
    }

    const chatId = message.chat.id.toString();

    if (!chatId || !isValidTelegramChat(chatId)) {
        console.log(`err: invalid chat.id for message (${chatId} is not authorized in TELEGRAM_CHAT_IDS)`);
        return;
    }

    const command = message.text
        .substr(botCommand.offset, botCommand.length)
        .split("@")[0]
        .substr(1);

    console.log({ command });

    switch (command) {
        case 'ping':
        await SendTelegramMessage(env, chatId, 'Beep, boop! Protobot is alive!');
        break;
    }
};