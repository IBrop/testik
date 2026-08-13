/* =========================================================
   IBrop — Main Page
========================================================= */


/* =========================================================
   DEFAULT ASSETS
========================================================= */

const DEFAULT_BANNER = "/assets/banner.png";
const DEFAULT_ICON = "/assets/favicon.png";


/* =========================================================
   PROFILE
========================================================= */

async function loadProfile() {

    try {

        const response = await fetch(
            "/data/profile.json",
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const profile = await response.json();


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


        if (name && profile.name) {

            name.textContent =
                profile.name;

        }


        if (subtitle && profile.subtitle) {

            subtitle.textContent =
                profile.subtitle;

        }


        if (description && profile.description) {

            description.textContent =
                profile.description;

        }


        if (avatar && profile.avatar) {

            avatar.src =
                profile.avatar;

        }

    }

    catch (error) {

        console.error(
            "Не удалось загрузить profile.json:",
            error
        );

    }

}


/* =========================================================
   LOAD PODIUM
========================================================= */

async function loadPodium() {

    const container =
        document.getElementById(
            "podium"
        );


    if (!container) {

        return;

    }


    try {

        const response = await fetch(
            "/data/portfolio.json",
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const projects =
            await response.json();


        if (!Array.isArray(projects)) {

            throw new Error(
                "portfolio.json должен содержать массив проектов"
            );

        }


        /* =================================================
           Ищем только проекты подиума
        ================================================= */

        const podiumProjects =
            projects.filter(
                project =>
                    project.visible !== false
                    &&
                    (
                        Number(project.podium) === 1
                        ||
                        Number(project.podium) === 2
                        ||
                        Number(project.podium) === 3
                    )
            );


        const place1 =
            podiumProjects.find(
                project =>
                    Number(project.podium) === 1
            );


        const place2 =
            podiumProjects.find(
                project =>
                    Number(project.podium) === 2
            );


        const place3 =
            podiumProjects.find(
                project =>
                    Number(project.podium) === 3
            );


        /*
            Визуальный порядок:

            2 | 1 | 3
        */

        const ordered = [
            place2,
            place1,
            place3
        ];


        container.innerHTML = "";


        ordered.forEach(
            project => {

                if (!project) {

                    return;

                }


                container.insertAdjacentHTML(
                    "beforeend",
                    createPodiumItem(project)
                );

            }
        );


        /* =================================================
           Если вообще ничего нет
        ================================================= */

        if (container.children.length === 0) {

            container.innerHTML = `

                <div class="podium-empty">

                    Подиум пока пуст.

                </div>

            `;

        }


        /*
            После создания карточек
            подключаем защиту картинок.
        */

        setupImageFallbacks();

    }

    catch (error) {

        console.error(
            "Не удалось загрузить подиум:",
            error
        );


        container.innerHTML = `

            <div class="podium-empty">

                Не удалось загрузить подиум.

            </div>

        `;

    }

}


/* =========================================================
   CREATE PODIUM ITEM
========================================================= */

function createPodiumItem(project) {

    const place =
        Number(project.podium);


    /* =====================================================
       MEDAL
    ====================================================== */

    let medal = "🏅";


    if (place === 1) {

        medal = "🥇";

    }

    else if (place === 2) {

        medal = "🥈";

    }

    else if (place === 3) {

        medal = "🥉";

    }


    /* =====================================================
       PROJECT DATA
    ====================================================== */

    const name =
        project.name ||
        "Без названия";


    const description =
        project.description ||
        "";


    /*
        Если banner отсутствует,
        пустой или null:

        → используем /assets/banner.png
    */

    const banner =
        project.banner
            ? project.banner
            : DEFAULT_BANNER;


    /*
        Аналогично для иконки.
    */

    const icon =
        project.icon
            ? project.icon
            : DEFAULT_ICON;


    /*
        Если URL не указан,
        строим его из ID.
    */

    const url =
        project.url
        ||
        (
            project.id
                ? `/portfolio/${project.id}/`
                : "/portfolio/"
        );


    /* =====================================================
       HTML
    ====================================================== */

    return `

        <div
            class="podium-item place-${place}"
        >

            <!-- =============================
                 MEDAL
            ============================== -->

            <div class="podium-medal">

                ${medal}

            </div>


            <!-- =============================
                 PROJECT
            ============================== -->

            <a
                class="podium-project"
                href="${escapeHTML(url)}"
            >


                <!-- =========================
                     BANNER
                ========================== -->

                <div class="podium-banner">

                    <img
                        class="project-banner-image"
                        src="${escapeHTML(banner)}"
                        data-fallback="${DEFAULT_BANNER}"
                        alt=""
                        loading="lazy"
                    >

                </div>


                <!-- =========================
                     BODY
                ========================== -->

                <div class="podium-project-body">


                    <!-- ICON -->

                    <img
                        class="podium-icon project-icon-image"
                        src="${escapeHTML(icon)}"
                        data-fallback="${DEFAULT_ICON}"
                        alt="${escapeHTML(name)}"
                        loading="lazy"
                    >


                    <!-- NAME -->

                    <div class="podium-project-name">

                        ${escapeHTML(name)}

                    </div>


                    <!-- DESCRIPTION -->

                    <div class="podium-project-description">

                        ${escapeHTML(description)}

                    </div>


                    <!-- OPEN -->

                    <div class="podium-project-arrow">

                        Открыть проект →

                    </div>


                </div>

            </a>


            <!-- =============================
                 PODIUM BASE
            ============================== -->

            <div class="podium-base">

                ${place}

            </div>

        </div>

    `;

}


/* =========================================================
   IMAGE FALLBACK SYSTEM
========================================================= */

function setupImageFallbacks() {

    const images =
        document.querySelectorAll(
            "img[data-fallback]"
        );


    images.forEach(
        image => {

            image.addEventListener(
                "error",
                () => {

                    const fallback =
                        image.dataset.fallback;


                    /*
                        Не допускаем бесконечный цикл,
                        если даже fallback отсутствует.
                    */

                    if (
                        !fallback
                        ||
                        image.src.endsWith(fallback)
                    ) {

                        return;

                    }


                    console.warn(
                        "Изображение не найдено:",
                        image.src,
                        "→ используем:",
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
        !easterEgg
        ||
        !easterDot
    ) {

        return;

    }


    /* =====================================================
       CLICK
    ====================================================== */

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


    /* =====================================================
       CLICK OUTSIDE
    ====================================================== */

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
