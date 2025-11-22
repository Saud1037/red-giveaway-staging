function parseTime(timeStr) {
    // مثال بسيط: يحوّل 10m → 600000 ms
    const num = parseInt(timeStr);
    if (timeStr.endsWith('s')) return num * 1000;
    if (timeStr.endsWith('m')) return num * 60 * 1000;
    if (timeStr.endsWith('h')) return num * 60 * 60 * 1000;
    if (timeStr.endsWith('d')) return num * 24 * 60 * 60 * 1000;
    return null;
}

module.exports = { parseTime };