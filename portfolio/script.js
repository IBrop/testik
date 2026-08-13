/* =========================================================
   IBrop Portfolio
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const PORTFOLIO_DATA_URL = "/data/portfolio.json";

const DEFAULT_BANNER = "/assets/banner.png";
const DEFAULT_ICON = "/assets/favicon.png";


/* =========================================================
   GLOBAL DATA
========================================================= */

let allProjects = [];

let currentFilter = "all";


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
            PORTFOLIO_DATA_URL,
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


        /*
            Оставляем только видимые проекты.
        */

        allProjects = data
            .filter(
                project =>
                    project.visible !== false
            )
            .sort(sortProjects);


        renderPinnedProjects();

        renderAllProjects();

        renderFilters();

        setupFilterButtons();

    }

    catch (error) {

        console.error(
            "Ошибка загрузки portfolio.json:",
            error
        );


        showPortfolioError();

    }

}


/* =========================================================
   SORT PROJECTS
========================================================= */

function sortProjects(a, b) {

    const orderA =
        Number.isFinite(Number(a.order))
            ? Number(a.order)
            : 999999;


    const orderB =
        Number.isFinite(Number(b.order))
            ? Number(b.order)
            : 999999;


    return orderA - orderB;

}


/* =========================================================
   PINNED PROJECTS
========================================================= */

function renderPinnedProjects() {

    const section =
        document.getElementById(
            "pinned-section"
        );


    const container =
        document.getElementById(
            "pinned-projects"
        );


    if (!container) {

        return;

    }


    const pinnedProjects =
        allProjects.filter(
            project =>
                project.pinned === true
        );


    container.innerHTML = "";


    /*
        Если закреплённых проектов нет,
        скрываем весь раздел.
    */

    if (pinnedProjects.length === 0) {

        if (section) {

            section.style.display =
                "none";

        }

        return;

    }


    if (section) {

        section.style.display =
            "";

    }


    pinnedProjects.forEach(
        project => {

            container.insertAdjacentHTML(
                "beforeend",
                createProjectCard(
                    project,
                    true
                )
            );

        }
    );


    setupImageFallbacks(container);

}


/* =========================================================
   ALL PROJECTS
========================================================= */

function renderAllProjects() {

    const container =
        document.getElementById(
            "all-projects"
        );


    if (!container) {

        return;

    }


    let projects =
        [...allProjects];


    /*
        Фильтрация по категории.
    */

    if (currentFilter !== "all") {

        projects =
            projects.filter(
                project =>
                    normalizeCategory(
                        project.category
                    )
                    ===
                    currentFilter
            );

    }


    container.innerHTML = "";


    if (projects.length === 0) {

        container.innerHTML = `

            <div class="projects-empty">

                Здесь пока ничего нет.

            </div>

        `;

        return;

    }


    projects.forEach(
        project => {

            container.insertAdjacentHTML(
                "beforeend",
                createProjectCard(
                    project,
                    false
                )
            );

        }
    );


    setupImageFallbacks(container);

}


/* =========================================================
   CREATE PROJECT CARD
========================================================= */

function createProjectCard(
    project,
    pinnedCard = false
) {

    /* =====================================================
       DATA
    ====================================================== */

    const id =
        project.id ||
        "";


    const name =
        project.name ||
        "Без названия";


    const description =
        project.description ||
        "";


    const category =
        project.category ||
        "Other";


    const statusText =
        project.status_text ||
        project.status ||
        "Unknown";


    /*
        Если banner:

        - отсутствует
        - null
        - ""
        - undefined

        используем стандартный баннер.
    */

    const banner =
        project.banner
            ? project.banner
            : DEFAULT_BANNER;


    /*
        То же самое с иконкой.
    */

    const icon =
        project.icon
            ? project.icon
            : DEFAULT_ICON;


    /*
        Если URL не задан,
        автоматически создаём:

        /portfolio/project-id/
    */

    const url =
        project.url
        ||
        (
            id
                ? `/portfolio/${id}/`
                : "/portfolio/"
        );


    /* =====================================================
       PINNED LABEL
    ====================================================== */

    const pinnedBadge =
        pinnedCard
            ? `
                <div class="project-pinned-badge">
                    Закреплено
                </div>
            `
            : "";


    /* =====================================================
       HTML
    ====================================================== */

    return `

        <a
            class="project-card"
            href="${escapeHTML(url)}"
            data-category="${escapeHTML(
                normalizeCategory(category)
            )}"
        >

            <!-- =============================
                 BANNER
            ============================== -->

            <div class="project-banner">

                <img
                    class="project-banner-image"
                    src="${escapeHTML(banner)}"
                    data-fallback="${escapeHTML(DEFAULT_BANNER)}"
                    alt=""
                    loading="lazy"
                >


                ${pinnedBadge}

            </div>


            <!-- =============================
                 PROJECT CONTENT
            ============================== -->

            <div class="project-content">


                <!-- ICON -->

                <img
                    class="project-icon"
                    src="${escapeHTML(icon)}"
                    data-fallback="${escapeHTML(DEFAULT_ICON)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                >


                <!-- INFO -->

                <div class="project-info">


                    <div class="project-heading">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>


                        <span class="project-category">

                            ${escapeHTML(category)}

                        </span>

                    </div>


                    <p class="project-description">

                        ${escapeHTML(description)}

                    </p>


                    <div class="project-bottom">


                        <div
                            class="
                                project-status
                                status-${escapeHTML(
                                    normalizeStatus(
                                        project.status
                                    )
                                )}
                            "
                        >

                            <span class="status-dot"></span>

                            ${escapeHTML(statusText)}

                        </div>


                        <div class="project-arrow">
                            →
                        </div>


                    </div>

                </div>

            </div>

        </a>

    `;

}


/* =========================================================
   FILTERS
========================================================= */

function renderFilters() {

    const container =
        document.getElementById(
            "dynamic-filters"
        );


    if (!container) {

        return;

    }


    /*
        Берём категории всех проектов.
    */

    const categoryMap =
        new Map();


    allProjects.forEach(
        project => {

            const category =
                project.category ||
                "Other";


            const normalized =
                normalizeCategory(
                    category
                );


            /*
                Map нужен, чтобы:

                Security
                SECURITY
                security

                не превращались
                в три разных фильтра.
            */

            if (!categoryMap.has(normalized)) {

                categoryMap.set(
                    normalized,
                    category
                );

            }

        }
    );


    container.innerHTML = "";


    categoryMap.forEach(
        (
            displayName,
            normalized
        ) => {

            container.insertAdjacentHTML(
                "beforeend",
                `

                    <button
                        class="filter"
                        data-filter="${escapeHTML(normalized)}"
                    >

                        ${escapeHTML(displayName)}

                    </button>

                `
            );

        }
    );

}


/* =========================================================
   FILTER BUTTONS
========================================================= */

function setupFilterButtons() {

    const buttons =
        document.querySelectorAll(
            ".filter"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const filter =
                        button.dataset.filter
                        ||
                        "all";


                    currentFilter =
                        filter;


                    /*
                        Убираем active
                        со всех кнопок.
                    */

                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    /*
                        Добавляем active
                        выбранной кнопке.
                    */

                    button.classList.add(
                        "active"
                    );


                    /*
                        Перерисовываем
                        список проектов.
                    */

                    renderAllProjects();

                }
            );

        }
    );

}


/* =========================================================
   IMAGE FALLBACKS
========================================================= */

function setupImageFallbacks(root = document) {

    const images =
        root.querySelectorAll(
            "img[data-fallback]"
        );


    images.forEach(
        image => {

            /*
                Чтобы случайно не повесить
                обработчик два раза.
            */

            if (
                image.dataset.fallbackReady
                ===
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


                    /*
                        Проверяем, не пытаемся ли
                        мы уже загрузить fallback.

                        Иначе при отсутствии
                        /assets/banner.png
                        получится бесконечный цикл.
                    */

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
                        currentPath
                        ===
                        fallbackPath
                    ) {

                        console.error(
                            "Fallback изображение тоже не найдено:",
                            fallback
                        );

                        return;

                    }


                    console.warn(
                        "Изображение не найдено:",
                        currentPath,
                        "→",
                        fallback
                    );


                    image.src =
                        fallback;

                }
            );

        }
    );

}


/* =========================================================
   NORMALIZE CATEGORY
========================================================= */

function normalizeCategory(category) {

    return String(
        category ||
        "Other"
    )
        .trim()
        .toLowerCase()
        .replaceAll(
            " ",
            "-"
        );

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(status) {

    const value =
        String(
            status ||
            "unknown"
        )
            .trim()
            .toLowerCase();


    /*
        Разрешённые статусы.
    */

    const allowedStatuses = [

        "concept",
        "development",
        "beta",
        "active",
        "released",
        "maintenance",
        "paused",
        "archived"

    ];


    if (
        allowedStatuses.includes(
            value
        )
    ) {

        return value;

    }


    return "unknown";

}


/* =========================================================
   ERROR
========================================================= */

function showPortfolioError() {

    const pinned =
        document.getElementById(
            "pinned-projects"
        );


    const all =
        document.getElementById(
            "all-projects"
        );


    if (pinned) {

        pinned.innerHTML = "";

    }


    if (all) {

        all.innerHTML = `

            <div class="projects-empty">

                Не удалось загрузить проекты :(

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
