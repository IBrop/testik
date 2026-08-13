/* =========================================================
   IBrop Main Page
========================================================= */


/* =========================================================
   PROFILE
========================================================= */

async function loadProfile() {

    try {

        const response =
            await fetch(
                "/data/profile.json",
                {
                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const profile =
            await response.json();


        const name =
            document.getElementById(
                "profile-name"
            );


        const subtitle =
            document.getElementById(
                "profile-subtitle"
            );


        const description =
            document.getElementById(
                "profile-description"
            );


        const avatar =
            document.getElementById(
                "profile-avatar"
            );


        if (
            name &&
            profile.name
        ) {

            name.textContent =
                profile.name;

        }


        if (
            subtitle &&
            profile.subtitle
        ) {

            subtitle.textContent =
                profile.subtitle;

        }


        if (
            description &&
            profile.description
        ) {

            description.textContent =
                profile.description;

        }


        if (
            avatar &&
            profile.avatar
        ) {

            avatar.src =
                profile.avatar;

        }

    }

    catch (
        error
    ) {

        console.error(
            "Не удалось загрузить profile.json:",
            error
        );

    }

}


/* =========================================================
   PODIUM
========================================================= */

async function loadPodium() {

    const container =
        document.getElementById(
            "podium"
        );


    if (
        !container
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                "/data/portfolio.json",
                {
                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const projects =
            await response.json();


        if (
            !Array.isArray(
                projects
            )
        ) {

            throw new Error(
                "portfolio.json должен содержать массив проектов"
            );

        }


        const podiumProjects =
            projects

                .filter(
                    project =>
                        project.visible !== false
                        &&
                        (
                            project.podium === 1
                            ||
                            project.podium === 2
                            ||
                            project.podium === 3
                        )
                )

                .sort(
                    (a, b) =>
                        a.podium -
                        b.podium
                );


        container.innerHTML =
            "";


        /*
            ВАЖНО:
            визуальный порядок пьедестала:
            2 | 1 | 3
        */


        const place1 =
            podiumProjects.find(
                project =>
                    project.podium === 1
            );


        const place2 =
            podiumProjects.find(
                project =>
                    project.podium === 2
            );


        const place3 =
            podiumProjects.find(
                project =>
                    project.podium === 3
            );


        const ordered =
            [
                place2,
                place1,
                place3
            ];


        ordered.forEach(
            project => {

                if (
                    !project
                ) {

                    return;

                }


                container.insertAdjacentHTML(
                    "beforeend",
                    createPodiumItem(
                        project
                    )
                );

            }
        );


        if (
            container.children.length === 0
        ) {

            container.innerHTML = `
                <div>
                    Подиум пока пуст.
                </div>
            `;

        }

    }

    catch (
        error
    ) {

        console.error(
            "Не удалось загрузить podium:",
            error
        );


        container.innerHTML = `
            <div>
                Не удалось загрузить подиум.
            </div>
        `;

    }

}


/* =========================================================
   CREATE PODIUM ITEM
========================================================= */

function createPodiumItem(
    project
) {

    const place =
        Number(
            project.podium
        );


    const medal =
        place === 1
            ? "🥇"
            : place === 2
                ? "🥈"
                : "🥉";


    const name =
        project.name
        ??
        "Без названия";


    const description =
        project.description
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
        `/portfolio/${project.id}/`;


    return `

        <div
            class="podium-item place-${place}"
        >

            <div class="podium-medal">
                ${medal}
            </div>


            <a
                class="podium-project"
                href="${escapeHTML(url)}"
            >

                <div class="podium-banner">

                    <img
                        src="${escapeHTML(banner)}"
                        alt=""
                    >

                </div>


                <div class="podium-project-body">

                    <img
                        class="podium-icon"
                        src="${escapeHTML(icon)}"
                        alt="${escapeHTML(name)}"
                    >


                    <div class="podium-project-name">
                        ${escapeHTML(name)}
                    </div>


                    <div class="podium-project-description">
                        ${escapeHTML(description)}
                    </div>


                    <div class="podium-project-arrow">
                        Открыть проект →
                    </div>

                </div>

            </a>


            <div class="podium-base">
                ${place}
            </div>

        </div>

    `;

}


/* =========================================================
   EASTER EGG
========================================================= */

function setupEasterEgg() {

    const easterEgg =
        document.getElementById(
            "easterEgg"
        );


    const easterDot =
        document.getElementById(
            "easterDot"
        );


    if (
        !easterEgg ||
        !easterDot
    ) {

        return;

    }


    easterDot.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            easterEgg
                .classList
                .toggle(
                    "open"
                );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !easterEgg.contains(
                    event.target
                )
            ) {

                easterEgg
                    .classList
                    .remove(
                        "open"
                    );

            }

        }
    );

}


/* =========================================================
   ESCAPE
========================================================= */

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


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProfile();

        loadPodium();

        setupEasterEgg();

    }
);
