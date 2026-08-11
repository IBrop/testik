async function loadProfile() {

    try {

        const response =
            await fetch("/data/profile.json");

        const profile =
            await response.json();


        document
            .getElementById("profile-name")
            .textContent =
            profile.name;


        document
            .getElementById("profile-subtitle")
            .textContent =
            profile.subtitle;


        document
            .getElementById("profile-description")
            .textContent =
            profile.description;


        document
            .getElementById("profile-avatar")
            .src =
            profile.avatar;


        document
            .getElementById("projects-title")
            .textContent =
            profile.projects_title;

    }

    catch (error) {

        console.error(
            "Не удалось загрузить профиль:",
            error
        );

    }

}



async function loadProjects() {

    const container =
        document.getElementById(
            "featured-projects"
        );


    try {

        const response =
            await fetch(
                "/data/projects.json"
            );


        const projects =
            await response.json();


        const favoriteProjects =
            projects
                .filter(
                    project =>
                        project.favorite
                )
                .slice(0, 4);


        favoriteProjects.forEach(
            project => {

                const card =
                    document.createElement(
                        "a"
                    );


                card.className =
                    "project-card";


                card.href =
                    `/portfolio/${project.slug}/`;


                card.innerHTML = `

                    <img
                        class="project-icon"
                        src="${project.icon}"
                        alt="${project.name}"
                    >

                    <div class="project-info">

                        <div class="project-name">
                            ${project.name}
                        </div>

                        <div class="project-description">
                            ${project.description}
                        </div>

                        <div class="project-status">
                            <span class="status-dot"></span>

                            ${project.status_text}
                        </div>

                    </div>
                `;


                container.appendChild(
                    card
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Не удалось загрузить проекты:",
            error
        );


        container.innerHTML =
            "<p>Проекты временно потерялись где-то между серверами.</p>";

    }

}



loadProfile();

loadProjects();
