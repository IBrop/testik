/* =========================
   PROFILE
========================= */

async function loadProfile() {

    try {

        const response =
            await fetch(
                "/data/profile.json"
            );


        if (!response.ok) {

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


        const projectsTitle =
            document.getElementById(
                "projects-title"
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


        if (
            projectsTitle &&
            profile.projects_title
        ) {

            projectsTitle.textContent =
                profile.projects_title;

        }

    }

    catch (error) {

        console.error(
            "Не удалось загрузить profile.json:",
            error
        );

    }

}



/* =========================
   PROJECTS
========================= */

async function loadProjects() {

    const container =
        document.getElementById(
            "featured-projects"
        );


    if (!container) {

        return;

    }


    try {

        const response =
            await fetch(
                "/data/portfolio.json"
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const projects =
            await response.json();


        const favoriteProjects =
            projects
                .filter(
                    project =>
                        project.visible !== false
                        &&
                        project.favorite === true
                )
                .sort(
                    (a, b) =>
                        (
                            a.order
                            ?? 999
                        )
                        -
                        (
                            b.order
                            ?? 999
                        )
                )
                .slice(
                    0,
                    4
                );


        container.innerHTML =
            "";


        favoriteProjects.forEach(
            project => {

                const card =
                    document.createElement(
                        "a"
                    );


                card.className =
                    "project-card";


                card.href =
                    project.url
                    ||
                    `/portfolio/${project.id}/`;


                card.innerHTML = `

                    <img
                        class="project-icon"
                        src="${escapeHTML(
                            project.icon
                        )}"
                        alt="${escapeHTML(
                            project.name
                        )}"
                    >


                    <div class="project-info">

                        <div class="project-name">

                            ${escapeHTML(
                                project.name
                            )}

                        </div>


                        <div class="project-description">

                            ${escapeHTML(
                                project.description
                                ?? ""
                            )}

                        </div>


                        <div class="project-status">

                            <span class="status-dot"></span>

                            ${escapeHTML(
                                project.status_text
                                ??
                                project.status
                                ??
                                ""
                            )}

                        </div>

                    </div>
                `;


                container.appendChild(
                    card
                );

            }
        );


        if (
            favoriteProjects.length === 0
        ) {

            container.innerHTML = `
                <p>
                    Здесь скоро появятся проекты.
                </p>
            `;

        }

    }

    catch (error) {

        console.error(
            "Не удалось загрузить portfolio.json:",
            error
        );


        container.innerHTML = `
            <p>
                Не удалось загрузить проекты.
            </p>
        `;

    }

}



/* =========================
   EASTER EGG
========================= */

function setupEasterEgg() {

    const easterEgg =
        document.getElementById(
            "easterEgg"
        );


    const hotspot =
        document.getElementById(
            "easterHotspot"
        );


    if (
        !easterEgg ||
        !hotspot
    ) {

        return;

    }


    /*
        На компьютере работает hover из CSS.

        Нажатие нужно в основном
        для телефона.
    */

    hotspot.addEventListener(
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


    /*
        Клик вне пасхалки закрывает её.
    */

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


    /*
        Escape тоже закрывает.
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
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



/* =========================
   ESCAPE HTML
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

loadProfile();

loadProjects();

setupEasterEgg();
