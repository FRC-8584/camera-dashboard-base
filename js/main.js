import { state, applyPresetToState } from "./state.js";
import { appendLog } from "./logs.js";
import { updateMetrics } from "./metrics.js";
import { initStreamUI, updateImageFrame, parseResolution } from "./stream.js";
import { createPipelineStore } from "./pipeline.js";
import { createWS } from "./ws.js";
import { createRenderers } from "./ui/renderers.js";
import { createTabsController } from "./ui/tabs.js";

initStreamUI();

const pipelineSelectEl = document.querySelector("#pipeline");

// Pipeline store
const pipelineStore = createPipelineStore({ pipelineSelectEl, state });

// WS
const WS_URL = "ws://127.0.0.1:8080/ws";
let streamPending = false;
let paramsPending = false;

const ws = createWS({
    url: WS_URL,
    onOpen: () => {
        applyStream();
        applyParams();
    },
    onMessage: (raw) => {
        try {
            const msg = JSON.parse(raw);

            switch (msg.type) {
                case "log":
                    appendLog({
                        source: "server",
                        level: msg.level,
                        scope: msg.scope,
                        message: msg.message,
                    });
                    return;

                case "image":
                    updateImageFrame(msg);
                    return;

                case "metrics":
                    updateMetrics(msg);
                    return;
            }
        } catch {}

        appendLog({ scope: "ws", message: `recv: ${raw}` });
    },
});

function applyStream() {
    if (streamPending) return;
    streamPending = true;

    queueMicrotask(() => {
        streamPending = false;
        const { w, h } = parseResolution(state.resolution);
        ws.send("stream", { fps: state.fps, width: w, height: h, resolution: state.resolution });
    });
}

function applyParams() {
    if (paramsPending) return;
    paramsPending = true;

    queueMicrotask(() => {
        paramsPending = false;
        ws.send("params", {
            exposure_ev: state.exposure_ev,
            brightness: state.brightness,
            contrast: state.contrast,
            saturation: state.saturation,
            wb_auto: state.wb_auto,
            ...(state.wb_auto ? {} : { wb_temperature: state.wb_temperature }),
        });
    });
}

// Renderers + Tabs
const renderers = createRenderers({
    state,
    applyStream,
    applyParams,
    commitActivePresetFromState: () => pipelineStore.commitActivePresetFromState(),
});

const tabsCtrl = createTabsController({ renderers });

// Pipeline switching
function switchPipeline(id) {
    const preset = pipelineStore.switchTo(id);
    if (!preset) return;

    applyPresetToState(preset);

    applyStream();
    applyParams();

    tabsCtrl.rerenderActiveTab();

    appendLog({ scope: "pipeline", message: `switched -> ${pipelineStore.getActiveId()}` });
}

if (pipelineSelectEl) {
    pipelineSelectEl.addEventListener("change", () => {
        switchPipeline(pipelineSelectEl.value);
    });
}

// Boot
applyPresetToState(pipelineStore.getActivePreset());

ws.connect();

applyStream();
applyParams();

tabsCtrl.showTab(document.querySelector(".tab.is-active")?.dataset.tab ?? "parameters");

// document
document.getElementById("doc-button").addEventListener("click", () => {
  window.open(
    "https://github.com/FRC-8584/camera-dashboard-base",
    "_blank",
    "noopener,noreferrer"
  );
});