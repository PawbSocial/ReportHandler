import { getId } from "./constants.js";

export const SendTelegramMessage = async (env, chatIdOrType, message, options = {}, isErrorMessage) => {
    const chatId = getId(chatIdOrType);

    if (!env.TELEGRAM_BOT_TOKEN || !chatId) {
        console.log({ env });
        throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    }
    
    const payload = {
        chat_id: chatId,
        text: message,
        ...options,
    };
    
    const response = await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: {  'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        console.error({
            message: 'Failed to send Telegram message',
            err: response.body,
            payload,
        });

        if (isErrorMessage) {
            console.error("Unable to send telegram error message in response to error sending message: " + message);
            throw new Error("Unable to send telegram error message in response to error sending message: " + message);
        }

        const body = response.body;
        await SendTelegramMessage(env, "admin", `@crashdoom Something is wrong, I was unable to send a message: ${JSON.stringify(body)}`, {}, true);
    } else {
        console.log(`OK: Sent message to ${chatId}`);
    }
}