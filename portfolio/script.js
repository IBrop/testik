/* =========================================================
   IBrop Portfolio
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const PORTFOLIO_URL = "/data/portfolio.json";

const DEFAULT_BANNER = "/assets/banner.png";
const DEFAULT_ICON = "/assets/favicon.png";


/* =========================================================
   STATE
========================================================= */

let projects = [];
let activeFilter = "all";


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadPortfolio();
    }
);


/* =========================================================
   LOAD PORTFOLIO
========================================================= */

async function loadPortfolio() {

    try {

        const response = await fetch(
            PORTFOLIO_URL,
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data = await response.json();


        if (!Array.isArray(data)) {
            throw new Error(
                "portfolio.json должен содержать массив проектов"
            );
        }


        projects = data
            .filter(
                project =>
                    project.visible !== false
            )
            .sort(
                (a, b) =>
                    (Number(a.order) || 999)
                    -
                    (Number(b.order) || 999)
            );


        buildFilters();
        renderPinned();
        renderAll();

    }

    catch (error) {

        console.error(
            "Ошибка загрузки portfolio.json:",
            error
        );


        showError(
            "Не удалось загрузить проекты."
        );

    }

}


/* =========================================================
   FILTERS
========================================================= */

function buildFilters() {

    const container =
        document.getElementById(
            "dynamic-filters"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const categories = [
        ...new Set(
            projects
                .map(
                    project =>
                        project.category
                )
                .filter(Boolean)
        )
    ];


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";
            button.className = "filter";

            button.dataset.filter =
                category;

            button.textContent =
                category;


            button.addEventListener(
                "click",
                () => {
                    setFilter(
                        category
                    );
                }
            );


            container.appendChild(
                button
            );

        }
    );


    const allButton =
        document.querySelector(
            '[data-filter="all"]'
        );


    if (allButton) {

        allButton.onclick =
            () => {
                setFilter("all");
            };

    }

}


/* =========================================================
   SET FILTER
========================================================= */

function setFilter(filter) {

    activeFilter = filter;


    document
        .querySelectorAll(
            ".filter"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter === filter
                );

            }
        );


    renderAll();

}


/* =========================================================
   PINNED
========================================================= */

function renderPinned() {

    const section =
        document.getElementById(
            "pinned-section"
        );


    const container =
        document.getElementById(
            "pinned-projects"
        );


    if (
        !section ||
        !container
    ) {
        return;
    }


    const pinnedProjects =
        projects.filter(
            project =>
                project.pinned === true
        );


    if (
        pinnedProjects.length === 0
    ) {

        section.style.display =
            "none";

        return;
    }


    section.style.display =
        "";


    container.innerHTML =
        pinnedProjects
            .map(
                project =>
                    createProjectCard(
                        project,
                        true
                    )
            )
            .join("");


    setupImageFallbacks(
        container
    );

}


/* =========================================================
   ALL PROJECTS
========================================================= */

function renderAll() {

    const container =
        document.getElementById(
            "all-projects"
        );


    if (!container) {
        return;
    }


    let filtered =
        projects;


    if (
        activeFilter !== "all"
    ) {

        filtered =
            projects.filter(
                project =>
                    project.category ===
                    activeFilter
            );

    }


    if (
        filtered.length === 0
    ) {

        container.innerHTML = `

            <div class="load-error">
                В этой категории пока нет проектов.
            </div>

        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(
                project =>
                    createProjectCard(
                        project,
                        false
                    )
            )
            .join("");


    setupImageFallbacks(
        container
    );

}


/* =========================================================
   CREATE PROJECT CARD
========================================================= */

function createProjectCard(
    project,
    showPin
) {

    const id =
        project.id
        ??
        "project";


    const name =
        project.name
        ??
        "Без названия";


    const description =
        project.description
        ??
        "";


    const category =
        project.category
        ??
        "Other";


    const status =
        project.status_text
        ??
        project.status
        ??
        "";


    const url =
        project.url
        ??
        `/portfolio/${id}/`;


    const icon =
        project.icon
        ??
        DEFAULT_ICON;


    const banner =
        project.banner
        ??
        DEFAULT_BANNER;


    const pin =
        showPin
            ? `
                <div class="pin">
                    Закреплено
                </div>
              `
            : "";


    return `

        <a
            class="project-card"
            href="${escapeHTML(url)}"
        >

            ${pin}


            <!-- BANNER -->

            <div class="project-banner">

                <img
                    class="project-banner-image"
                    src="${escapeHTML(banner)}"
                    data-fallback="${DEFAULT_BANNER}"
                    alt=""
                    loading="lazy"
                >

            </div>


            <!-- BODY -->

            <div class="project-body">


                <!-- ICON -->

                <img
                    class="project-icon"
                    src="${escapeHTML(icon)}"
                    data-fallback="${DEFAULT_ICON}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                >


                <!-- INFO -->

                <div class="project-info">

                    <div class="project-top">

                        <div class="project-name">
                            ${escapeHTML(name)}
                        </div>

                        <div class="project-category">
                            ${escapeHTML(category)}
                        </div>

                    </div>


                    <div class="project-description">
                        ${escapeHTML(description)}
                    </div>


                    <div class="project-bottom">

                        <div class="status">

                            <span class="status-dot"></span>

                            ${escapeHTML(status)}

                        </div>


                        <div class="arrow">
                            →
                        </div>

                    </div>

                </div>

            </div>

        </a>

    `;

}


/* =========================================================
   IMAGE FALLBACKS
========================================================= */

function setupImageFallbacks(root) {

    const images =
        root.querySelectorAll(
            "img[data-fallback]"
        );


    images.forEach(
        image => {

            if (
                image.dataset.fallbackReady ===
                "true"
            ) {
                return;
            }


            image.dataset.fallbackReady =
                "true";


            image.addEventListener(
                "error",
                () => {

                    const fallback =
                        image.dataset.fallback;


                    if (!fallback) {
                        return;
                    }


                    const currentPath =
                        new URL(
                            image.src,
                            window.location.origin
                        ).pathname;


                    const fallbackPath =
                        new URL(
                            fallback,
                            window.location.origin
                        ).pathname;


                    if (
                        currentPath === fallbackPath
                    ) {
                        return;
                    }


                    image.src =
                        fallback;

                }
            );

        }
    );

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    const pinnedSection =
        document.getElementById(
            "pinned-section"
        );


    const allProjects =
        document.getElementById(
            "all-projects"
        );


    if (pinnedSection) {
        pinnedSection.style.display =
            "none";
    }


    if (allProjects) {

        allProjects.innerHTML = `

            <div class="load-error">
                ${escapeHTML(message)}
            </div>

        `;

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
