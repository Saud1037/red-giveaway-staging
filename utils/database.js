// utils/database.js

// حفظ القيفاوي (تقدر تطوره لاحقاً يحفظ في Supabase)
async function saveGiveaway(giveaway) {
  // مؤقتاً نخزّنها في الذاكرة
  if (!global.giveaways) global.giveaways = {};
  global.giveaways[giveaway.id] = giveaway;

  console.log('✅ Saved giveaway in memory:', giveaway.id);
  return true;
}

// تحميل القيفاويات عند تشغيل البوت
async function loadGiveaways() {
  // لو كنت بتستخدم Supabase، هنا مكان الجلب من قاعدة البيانات
  // مؤقتاً بنخليها فاضية بس عشان ما يطيح البوت
  if (!global.giveaways) global.giveaways = {};

  console.log('✅ loadGiveaways called (حالياً بدون استرجاع من قاعدة بيانات)');
}

// تحميل إعدادات الترحيب
async function loadGreetSettings() {
  if (!global.greetSettings) global.greetSettings = {};

  console.log('✅ loadGreetSettings called (حالياً بدون استرجاع من قاعدة بيانات)');
}

// إنهاء القيفاوي (استدعاء من index.js)
async function endGiveaway(giveawayId) {
  const giveaway = global.giveaways?.[giveawayId];
  if (!giveaway) {
    console.log('⚠️ Tried to end giveaway that does not exist:', giveawayId);
    return;
  }

  // هنا المفروض تختار الفائزين وترسل رسالة – حالياً بس نحذفه
  delete global.giveaways[giveawayId];
  console.log('🎉 Giveaway ended (placeholder logic):', giveawayId);
}

// نصدر كل الدوال اللي تحتاجها index.js
module.exports = {
  saveGiveaway,
  loadGiveaways,
  loadGreetSettings,
  endGiveaway,
};