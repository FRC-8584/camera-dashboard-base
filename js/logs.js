const LOG_BUFFER_MAX = 500;
const logBuffer = [];

function formatLog({ source, level, scope, message }) {
    const time = new Date().toLocaleTimeString();
    return `[${time}][${source}][${level}][${scope}]: ${message}`;
}

export function appendLog({ source = "website", level = "info", scope = "system", message }) {
    const line = formatLog({ source, level, scope, message });

    logBuffer.push(line);
    if (logBuffer.length > LOG_BUFFER_MAX) logBuffer.shift();

    const logBox = document.querySelector('.panel-section[data-section="logs"] .log-box');
    if (logBox) {
        logBox.textContent = logBuffer.join("\n") + "\n";
        logBox.scrollTop = logBox.scrollHeight;
    }
}

export function clearLogs() {
    logBuffer.length = 0;
}

export function getLogsText() {
    return logBuffer.join("\n") + (logBuffer.length ? "\n" : "");
}
