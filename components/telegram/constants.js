export const TELEGRAM_CHAT_IDS = {
    "-846273469": "admin",
    "-1002011984935": "mod"
}

export const ADMIN_IDS = [
    "45694288", // Crashdoom
    "98436485", // itIsOasus
    "307123230", // Natebluehooves
    "35851168" // Doridian
];

export const isValidTelegramChat = (id) => {
    return Object.keys(TELEGRAM_CHAT_IDS).includes(id);
}

export const getChatIdByType = (type) => {
    for (const [k, v] of Object.entries(TELEGRAM_CHAT_IDS)) {
        if (v === type) {
            return k;
        }
    }

    return getChatIdByType("mod");
}

export const getId = (idOrType) => {
    if (idOrType.startsWith("-")) {
        return idOrType;
    }

    return getChatIdByType(idOrType);
}

export const isAdmin = (id) => {
    return ADMIN_IDS.includes(id);
}