const PORTFOLIO_URL =
    "/data/portfolio.json";


let projects = [];

let activeFilter =
    "all";


/* =========================
   LOAD
========================= */

async function loadPortfolio() {

    try {

        const response =
            await fetch(
                PORTFOLIO_URL
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        projects =
            data
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


        const allProjects =
            document.getElementById(
                "all-projects"
            );


        if (allProjects) {

            allProjects.innerHTML = `
                <div class="load-error">
                    Не удалось загрузить проекты.
                </div>
            `;

        }

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


    container.innerHTML =
        "";


    const categories =
        [
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
                        category,
                        button
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

        allButton.addEventListener(
            "click",
            () => {

                setFilter(
                    "all",
                    allButton
                );

            }
        );

    }

}


/* =========================
   SET FILTER
========================= */

function setFilter(
    filter,
    button
) {

    activeFilter =
        filter;


    document
        .querySelectorAll(
            ".filter"
        )
        .forEach(
            item => {

                item
                    .classList
                    .remove(
                        "active"
                    );

            }
        );


    button
        .classList
        .add(
            "active"
        );


    renderAll();

}


/* =========================
   PINNED
========================= */

function renderPinned() {

    const container =
        document.getElementById(
            "pinned-projects"
        );


    const section =
        document.getElementById(
            "pinned-section"
        );


    if (
        !container ||
        !section
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


    section.style.display =
        "";


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


    let filtered =
        projects;


    if (
        activeFilter !==
        "all"
    ) {

        filtered =
            projects.filter(
                project =>
                    project.category
                    === activeFilter
            );

    }


    if (
        filtered.length === 0
    ) {

        container.innerHTML = `
            <div class="load-error">
                В этой категории пока ничего нет.
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

}


/* =========================
   PROJECT CARD
========================= */

function createProjectCard(
    project,
    showPin
) {

    const name =
        escapeHTML(
            project.name
            ?? "Без названия"
        );


    const description =
        escapeHTML(
            project.description
            ?? ""
        );


    const category =
        escapeHTML(
            project.category
            ?? ""
        );


    const status =
        escapeHTML(
            project.status_text
            ??
            project.status
            ??
            ""
        );


    const url =
        escapeHTML(
            project.url
            ||
            `/portfolio/${project.id}/`
        );


    const icon =
        escapeHTML(
            project.icon
            ??
            "/assets/projects/default.png"
        );


    const banner =
        escapeHTML(
            project.banner
            ??
            project.icon
            ??
            "/assets/projects/default.png"
        );


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
            href="${url}"
        >

            ${pin}


            <!-- BANNER -->

            <div class="project-banner">

                <img
                    class="project-banner-image"
                    src="${banner}"
                    alt=""
                    loading="lazy"
                >

            </div>


            <!-- BODY -->

            <div class="project-body">


                <!-- ICON -->

                <img
                    class="project-icon"
                    src="${icon}"
                    alt="${name}"
                    loading="lazy"
                >


                <!-- INFO -->

                <div class="project-info">

                    <div class="project-top">

                        <div class="project-name">
                            ${name}
                        </div>

                        <div class="project-category">
                            ${category}
                        </div>

                    </div>


                    <div class="project-description">
                        ${description}
                    </div>


                    <div class="project-bottom">

                        <div class="status">

                            <span class="status-dot">
                            </span>

                            ${status}

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


/* =========================
   ESCAPE
========================= */

function escapeHTML(
    value
) {

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

loadPortfolio();
