const PORTFOLIO_URL = "https://ibrop.dev/data/portfolio.json";

let projects = [];
let activeFilter = "all";


/* =========================
   LOAD PORTFOLIO
========================= */

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
                    (a.order ?? 999)
                    -
                    (b.order ?? 999)
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
            "Не удалось загрузить проекты"
        );

    }

}


/* =========================
   ERROR
========================= */

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


/* =========================
   FILTERS
========================= */

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
                .filter(
                    category =>
                        typeof category === "string"
                        &&
                        category.trim() !== ""
                )
        )
    ];


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "filter";


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

                setFilter(
                    "all"
                );

            };

    }

}


/* =========================
   SET FILTER
========================= */

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
                    button.dataset.filter
                    === activeFilter
                );

            }
        );


    renderAll();

}


/* =========================
   PINNED
========================= */

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


    const pinned =
        projects.filter(
            project =>
                project.pinned === true
        );


    if (
        pinned.length === 0
    ) {

        section.style.display =
            "none";

        return;

    }


    section.style.display = "";


    container.innerHTML =
        pinned
            .map(
                project =>
                    createProjectCard(
                        project,
                        true
                    )
            )
            .join("");

}


/* =========================
   ALL PROJECTS
========================= */

function renderAll() {

    const container =
        document.getElementById(
            "all-projects"
        );


    if (!container) {

        return;

    }


    let filteredProjects =
        projects;


    if (
        activeFilter !== "all"
    ) {

        filteredProjects =
            projects.filter(
                project =>
                    project.category
                    === activeFilter
            );

    }


    if (
        filteredProjects.length === 0
    ) {

        container.innerHTML = `

            <div class="load-error">
                В этой категории пока нет проектов.
            </div>

        `;

        return;

    }


    container.innerHTML =
        filteredProjects
            .map(
                project =>
                    createProjectCard(
                        project,
                        false
                    )
            )
            .join("");

}


/* =========================
   CREATE PROJECT CARD
========================= */

function createProjectCard(
    project,
    showPin
) {

    const id =
        project.id
        ??
        project.slug
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
        "";


    const status =
        project.status_text
        ??
        project.status
        ??
        "";


    const icon =
        project.icon
        ??
        "/assets/projects/default.png";


    const banner =
        project.banner
        ??
        icon;


    const url =
        project.url
        ??
        `/portfolio/${id}/`;


    const pinBadge =
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

            ${pinBadge}


            <div class="project-banner">

                <img
                    class="project-banner-image"
                    src="${escapeHTML(banner)}"
                    alt=""
                    loading="lazy"
                >

            </div>


            <div class="project-body">


                <img
                    class="project-icon"
                    src="${escapeHTML(icon)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                >


                <div class="project-info">


                    <div class="project-top">

                        <div class="project-name">
                            ${escapeHTML(name)}
                        </div>


                        ${
                            category
                                ? `
                                    <div class="project-category">
                                        ${escapeHTML(category)}
                                    </div>
                                  `
                                : ""
                        }

                    </div>


                    ${
                        description
                            ? `
                                <div class="project-description">
                                    ${escapeHTML(description)}
                                </div>
                              `
                            : ""
                    }


                    <div class="project-bottom">

                        ${
                            status
                                ? `
                                    <div class="status">

                                        <span class="status-dot"></span>

                                        ${escapeHTML(status)}

                                    </div>
                                  `
                                : `
                                    <div></div>
                                  `
                        }


                        <div class="arrow">
                            →
                        </div>

                    </div>

                </div>

            </div>

        </a>

    `;

}


/* =========================
   ESCAPE HTML
========================= */

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


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPortfolio();

    }
);
