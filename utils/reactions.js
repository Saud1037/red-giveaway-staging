function addGiveawayReactions(message) {
    // مؤقت فقط – React برمز عشوائي
    try {
        message.react("🎉");
    } catch (e) {
        console.log("Could not react:", e);
    }
}

module.exports = { addGiveawayReactions };