import { appendLog, clearLogs, getLogsText } from "../logs.js";

export function createRenderers({
    state,
    applyStream,
    applyParams,
    commitActivePresetFromState,
}) {
    return {
        parameters(sectionEl) {
            sectionEl.innerHTML = `
                <div class="group">
                    <h4>Stream</h4>

                    <div class="field">
                        <label for="resolution">Resolution</label>
                        <select id="resolution">
                            <option value="640x480">640x480</option>
                            <option value="1280x720">1280x720</option>
                            <option value="1920x1080">1920x1080</option>
                        </select>
                    </div>

                    <div class="field">
                        <label for="fps">FPS</label>
                        <select id="fps">
                            <option value="15">15</option>
                            <option value="30">30</option>
                            <option value="60">60</option>
                        </select>
                    </div>
                </div>

                <div class="group">
                    <h4>Exposure</h4>

                    <div class="field">
                        <label for="exposure_ev">Exposure (EV)</label>
                        <input id="exposure_ev" type="range" min="-3" max="3" step="0.1" />
                        <span class="value" data-value-for="exposure_ev"></span>
                    </div>

                    <div class="field">
                        <label for="brightness">Brightness</label>
                        <input id="brightness" type="range" min="0" max="100" step="1" />
                        <span class="value" data-value-for="brightness"></span>
                    </div>
                </div>

                <div class="group">
                    <h4>Color</h4>

                    <div class="field">
                        <label for="contrast">Contrast</label>
                        <input id="contrast" type="range" min="0" max="100" step="1" />
                        <span class="value" data-value-for="contrast"></span>
                    </div>

                    <div class="field">
                        <label for="saturation">Saturation</label>
                        <input id="saturation" type="range" min="0" max="100" step="1" />
                        <span class="value" data-value-for="saturation"></span>
                    </div>

                    <div class="field">
                        <label for="wb_auto">White Balance (Auto)</label>
                        <input id="wb_auto" type="checkbox" />
                        <span class="value" data-value-for="wb_auto"></span>
                    </div>

                    <div class="field" id="wb_temp_field">
                        <label for="wb_temperature">Color Temperature (K)</label>
                        <input id="wb_temperature" type="range" min="2500" max="7500" step="100" />
                        <span class="value" data-value-for="wb_temperature"></span>
                    </div>
                </div>
            `;

            const resolutionSel = sectionEl.querySelector("#resolution");
            const fpsSel = sectionEl.querySelector("#fps");

            const exposureEv = sectionEl.querySelector("#exposure_ev");
            const brightness = sectionEl.querySelector("#brightness");
            const contrast = sectionEl.querySelector("#contrast");
            const saturation = sectionEl.querySelector("#saturation");

            const wbAuto = sectionEl.querySelector("#wb_auto");
            const wbTempField = sectionEl.querySelector("#wb_temp_field");
            const wbTemp = sectionEl.querySelector("#wb_temperature");

            function setValueText(id, text) {
                const el = sectionEl.querySelector(`.value[data-value-for="${id}"]`);
                if (el) el.textContent = text;
            }

            function syncWbUI() {
                setValueText("wb_auto", state.wb_auto ? "ON" : "OFF");
                wbTempField.style.display = state.wb_auto ? "none" : "";
            }

            function bindRangeCommit(inputEl, onPreview) {
                inputEl.addEventListener("input", () => {
                    onPreview();
                    commitActivePresetFromState();
                });

                inputEl.addEventListener("change", () => {
                    applyParams();
                    commitActivePresetFromState();
                });
            }

            // init UI values from state
            resolutionSel.value = state.resolution;
            fpsSel.value = String(state.fps);

            exposureEv.value = String(state.exposure_ev);
            brightness.value = String(state.brightness);
            contrast.value = String(state.contrast);
            saturation.value = String(state.saturation);

            wbAuto.checked = state.wb_auto;
            wbTemp.value = String(state.wb_temperature);

            // init value text
            setValueText("exposure_ev", Number(state.exposure_ev).toFixed(1));
            setValueText("brightness", String(state.brightness));
            setValueText("contrast", String(state.contrast));
            setValueText("saturation", String(state.saturation));
            setValueText("wb_temperature", `${state.wb_temperature}K`);
            syncWbUI();

            // Stream
            resolutionSel.addEventListener("change", () => {
                state.resolution = resolutionSel.value;
                applyStream();
                commitActivePresetFromState();
            });

            fpsSel.addEventListener("change", () => {
                state.fps = Number(fpsSel.value);
                applyStream();
                commitActivePresetFromState();
            });

            // Sliders
            bindRangeCommit(exposureEv, () => {
                state.exposure_ev = Number(exposureEv.value);
                setValueText("exposure_ev", state.exposure_ev.toFixed(1));
            });

            bindRangeCommit(brightness, () => {
                state.brightness = Number(brightness.value);
                setValueText("brightness", String(state.brightness));
            });

            bindRangeCommit(contrast, () => {
                state.contrast = Number(contrast.value);
                setValueText("contrast", String(state.contrast));
            });

            bindRangeCommit(saturation, () => {
                state.saturation = Number(saturation.value);
                setValueText("saturation", String(state.saturation));
            });

            // WB
            wbAuto.addEventListener("change", () => {
                state.wb_auto = wbAuto.checked;
                syncWbUI();
                applyParams();
                commitActivePresetFromState();
            });

            bindRangeCommit(wbTemp, () => {
                state.wb_temperature = Number(wbTemp.value);
                setValueText("wb_temperature", `${state.wb_temperature}K`);
            });
        },

        logs(sectionEl) {
            sectionEl.innerHTML = `
                <h3>Logs</h3>
                <button class="btn-clear" type="button">Clear</button>
                <pre class="log-box"></pre>
            `;

            const box = sectionEl.querySelector(".log-box");
            box.textContent = getLogsText();

            sectionEl.querySelector(".btn-clear").addEventListener("click", () => {
                clearLogs();
                box.textContent = "";
                appendLog({ level: "info", scope: "logs", message: "cleared" });
            });
        },
    };
}
