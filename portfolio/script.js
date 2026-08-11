const PORTFOLIO_URL =
    "/data/portfolio.json";


let projects = [];

let activeFilter = "all";


async function loadPortfolio() {

    try {

        const response =
            await fetch(PORTFOLIO_URL);


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


        document
            .getElementById(
                "all-projects"
            )
            .innerHTML = `
                <div>
                    Не удалось загрузить проекты.
                </div>
            `;

    }

}



function buildFilters() {

    const container =
        document.getElementById(
            "dynamic-filters"
        );


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
            item =>
                item
                    .classList
                    .remove("active")
        );


    button
        .classList
        .add("active");


    renderAll();

}



function renderPinned() {

    const container =
        document.getElementById(
            "pinned-projects"
        );


    const section =
        document.getElementById(
            "pinned-section"
        );


    const pinned =
        projects.filter(
            project =>
                project.pinned
        );


    if (
        pinned.length === 0
    ) {

        section.style.display =
            "none";

        return;
    }


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



function renderAll() {

    const container =
        document.getElementById(
            "all-projects"
        );


    let filtered =
        projects;


    if (
        activeFilter !== "all"
    ) {

        filtered =
            projects.filter(
                project =>
                    project.category
                    === activeFilter
            );

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



function createProjectCard(
    project,
    showPin
) {

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
            href="${escapeHTML(project.url)}"
        >

            ${pin}

            <div class="project-visual">

                <img
                    class="project-banner"
                    src="${escapeHTML(project.banner)}"
                    alt=""
                >

                <img
                    class="project-icon"
                    src="${escapeHTML(project.icon)}"
                    alt="${escapeHTML(project.name)}"
                >

            </div>


            <div class="project-info">

                <div class="project-top">

                    <div>

                        <div class="project-name">
                            ${escapeHTML(project.name)}
                        </div>

                        <div class="project-category">
                            ${escapeHTML(
                                project.category
                                ?? ""
                            )}
                        </div>

                    </div>

                </div>


                <div class="project-description">

                    ${escapeHTML(
                        project.description
                        ?? ""
                    )}

                </div>


                <div class="project-bottom">

                    <div class="status">

                        <span class="status-dot">
                        </span>

                        ${escapeHTML(
                            project.status_text
                            ?? project.status
                            ?? ""
                        )}

                    </div>

                    <div class="arrow">
                        →
                    </div>

                </div>

            </div>

        </a>

    `;

}



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



loadPortfolio();
