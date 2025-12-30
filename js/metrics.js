const metricEls = {
    tx: document.querySelector(".metric-tx b"),
    ty: document.querySelector(".metric-ty b"),
    fps: document.querySelector(".metric-fps b"),
    latency: document.querySelector(".metric-latency b"),
};

export function updateMetrics({ fps, latency_ms, tx, ty }) {
    if (metricEls.fps && Number.isFinite(fps)) metricEls.fps.textContent = fps.toFixed(1);
    if (metricEls.latency && Number.isFinite(latency_ms)) metricEls.latency.textContent = `${latency_ms} ms`;
    if (metricEls.tx && Number.isFinite(tx)) metricEls.tx.textContent = tx.toFixed(1);
    if (metricEls.ty && Number.isFinite(ty)) metricEls.ty.textContent = ty.toFixed(1);
}