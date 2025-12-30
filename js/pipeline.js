import { normalizeStateForPreset } from "./state.js";

const PIPELINE_STORAGE_KEY = "dashboard_pipeline_presets_v1";
const ACTIVE_PIPELINE_KEY = "dashboard_active_pipeline_v1";

function loadJson(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

function loadStr(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function saveStr(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {}
}

function buildDefaultPresetsFromHtmlOptions(pipelineSelectEl, state) {
    const presets = {};
    const options = Array.from(pipelineSelectEl?.options ?? []);
    options.forEach((opt, idx) => {
        const id = opt.value || `pipeline${idx + 1}`;
        presets[id] = normalizeStateForPreset(state);
    });
    if (!options.length) presets.pipeline1 = normalizeStateForPreset(state);
    return presets;
}

export function createPipelineStore({ pipelineSelectEl, state }) {
    let presets = loadJson(PIPELINE_STORAGE_KEY) || buildDefaultPresetsFromHtmlOptions(pipelineSelectEl, state);
    saveJson(PIPELINE_STORAGE_KEY, presets);

    let activeId = loadStr(ACTIVE_PIPELINE_KEY);

    if (pipelineSelectEl) {
        const validIds = new Set(Object.keys(presets));
        const htmlIds = new Set(Array.from(pipelineSelectEl.options).map(o => o.value));

        if (!activeId || !validIds.has(activeId)) {
            activeId = pipelineSelectEl.value || Array.from(htmlIds)[0] || "pipeline1";
            saveStr(ACTIVE_PIPELINE_KEY, activeId);
        }

        if (!htmlIds.has(activeId)) {
            const opt = document.createElement("option");
            opt.value = activeId;
            opt.textContent = activeId;
            pipelineSelectEl.appendChild(opt);
        }

        pipelineSelectEl.value = activeId;
    } else {
        if (!activeId) activeId = "pipeline1";
        saveStr(ACTIVE_PIPELINE_KEY, activeId);

        if (!presets[activeId]) {
            presets[activeId] = normalizeStateForPreset(state);
            saveJson(PIPELINE_STORAGE_KEY, presets);
        }
    }

    function getActiveId() {
        return activeId;
    }

    function getActivePreset() {
        if (!presets[activeId]) {
            presets[activeId] = normalizeStateForPreset(state);
            saveJson(PIPELINE_STORAGE_KEY, presets);
        }
        return presets[activeId];
    }

    function commitActivePresetFromState() {
        presets[activeId] = normalizeStateForPreset(state);
        saveJson(PIPELINE_STORAGE_KEY, presets);
    }

    function switchTo(id) {
        if (!id) return;

        commitActivePresetFromState();

        activeId = id;
        saveStr(ACTIVE_PIPELINE_KEY, activeId);

        if (!presets[activeId]) {
            presets[activeId] = normalizeStateForPreset(state);
            saveJson(PIPELINE_STORAGE_KEY, presets);
        }

        if (pipelineSelectEl && pipelineSelectEl.value !== activeId) {
            pipelineSelectEl.value = activeId;
        }

        return getActivePreset();
    }

    return { getActiveId, getActivePreset, commitActivePresetFromState, switchTo };
}