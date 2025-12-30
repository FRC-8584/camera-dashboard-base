export function createTabsController({ renderers }) {
    const tabs = document.querySelectorAll(".panel-tabs .tab");
    const sections = document.querySelectorAll(".panel-section");

    function rerenderActiveTab() {
        const activeTab = document.querySelector(".panel-tabs .tab.is-active")?.dataset.tab;
        if (!activeTab) return;

        const sec = document.querySelector(`.panel-section[data-section="${activeTab}"]`);
        if (!sec) return;

        renderers[activeTab]?.(sec);
    }

    function showTab(target) {
        tabs.forEach(t => t.classList.toggle("is-active", t.dataset.tab === target));

        sections.forEach(sec => {
            const isTarget = sec.dataset.section === target;
            sec.classList.toggle("hidden", !isTarget);

            if (isTarget) {
                renderers[target]?.(sec);
            } else {
                sec.innerHTML = "";
            }
        });
    }

    tabs.forEach(tab => tab.addEventListener("click", () => showTab(tab.dataset.tab)));

    return { showTab, rerenderActiveTab };
}