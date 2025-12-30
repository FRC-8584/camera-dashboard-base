import { appendLog } from "./logs.js";
import { setNoSignal } from "./stream.js";

export function createWS({ url, onMessage, onOpen }) {
    let ws = null;
    let connectTimer = null;

    let reconnectTimer = null;
    let reconnectDelay = 500;
    const RECONNECT_MAX = 5000;

    const queue = [];

    function scheduleReconnect() {
        if (reconnectTimer) return;

        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connect();
        }, reconnectDelay);

        reconnectDelay = Math.min(RECONNECT_MAX, Math.round(reconnectDelay * 1.8));
    }

    function resetReconnectBackoff() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        reconnectDelay = 500;
    }

    function connect() {
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

        appendLog({ scope: "ws", message: `connecting -> ${url}` });
        ws = new WebSocket(url);

        clearTimeout(connectTimer);
        connectTimer = setTimeout(() => {
            if (ws && ws.readyState === WebSocket.CONNECTING) {
                appendLog({ level: "error", scope: "ws", message: "connect timeout" });
                try { ws.close(); } catch {}
            }
        }, 3000);

        ws.addEventListener("open", () => {
            clearTimeout(connectTimer);
            resetReconnectBackoff();
            appendLog({ scope: "ws", message: "connected" });

            while (queue.length) ws.send(queue.shift());

            onOpen?.();
        });

        ws.addEventListener("message", (e) => {
            onMessage?.(e.data);
        });

        ws.addEventListener("close", () => {
            appendLog({ level: "warn", scope: "ws", message: "disconnected" });
            setNoSignal("Disconnected");
            scheduleReconnect();
        });

        ws.addEventListener("error", () => {
            appendLog({ level: "warn", scope: "ws", message: "socket error" });
            scheduleReconnect();
        });
    }

    function send(type, data) {
        const msg = JSON.stringify({ type, data, ts: Date.now() });
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            queue.push(msg);
            connect();
            return;
        }
        ws.send(msg);
    }

    return { connect, send };
}