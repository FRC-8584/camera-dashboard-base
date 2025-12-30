export const state = {
    fps: 30,
    resolution: "640x480",
    exposure_ev: 0.0,
    brightness: 50,
    contrast: 50,
    saturation: 50,
    wb_auto: true,
    wb_temperature: 5000,
};

export function normalizeStateForPreset(s) {
    return {
        fps: Number(s.fps),
        resolution: String(s.resolution),
        exposure_ev: Number(s.exposure_ev),
        brightness: Number(s.brightness),
        contrast: Number(s.contrast),
        saturation: Number(s.saturation),
        wb_auto: Boolean(s.wb_auto),
        wb_temperature: Number(s.wb_temperature),
    };
}

export function applyPresetToState(preset) {
    const p = normalizeStateForPreset(preset);
    Object.assign(state, p);

    if (!Number.isFinite(state.wb_temperature)) state.wb_temperature = 5000;
}
