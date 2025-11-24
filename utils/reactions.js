function handleReactionAdd(reaction, user) {
    if (user.bot) return;
    if (!reaction.message.guild) return;

    // مثال بسيط: التأكد أن الرياكشن 🎉 ويخص قيف أواي
    if (reaction.emoji.name === "🎉") {
        console.log(`${user.username} دخل القيف أواي!`);
        
        // هنا لو عندك نظام تسجيل مشاركين، استدعيه
        // مثال:
        // registerParticipant(reaction.message.id, user.id);
    }
}

function handleReactionRemove(reaction, user) {
    if (user.bot) return;
    if (!reaction.message.guild) return;

    if (reaction.emoji.name === "🎉") {
        console.log(`${user.username} خرج من القيف أواي!`);
        
        // حذف المشاركة
        // unregisterParticipant(reaction.message.id, user.id);
    }
}

module.exports = {
    handleReactionAdd,
    handleReactionRemove
};