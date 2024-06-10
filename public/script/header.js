import { getCurrentUser } from "./utils.js";


async function displayHeaderTemplate() {
    await fetch("/templates/header.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById('header').innerHTML = html;
        })
        .catch(error => console.error('Ошибка загрузки файла:', error));
}


async function displayUserInfo() {
    var authSection = document.getElementById('auth-section')
    if (localStorage.getItem('token')) {
        const currentUser = await getCurrentUser()
        if (currentUser) {
            authSection.innerHTML = `
            <div class="dropdown">
                <a class="btn btn-outline-light w-100 border border-light border-3 rounded-pill dropdown-toggle me-3 px-4" href="/profile" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="fs-5">${currentUser.username}</span>
                    <i class="bi bi-person-fill fs-5"></i>
                </a>
            
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/route-optimizer">Рассчитать маршрут</a></li>
                    <li><a class="dropdown-item" href="/saved">Сохраненные маршруты</a></li>
                    <li><a class="dropdown-item" href="/logout">Выйти</a></li>
                </ul>
            </div>
        `
            return
        }
        localStorage.removeItem('token')
    }
    authSection.innerHTML = `
            <a href="/sign-in" class="nav-link">
                <button type="button" class="btn btn-outline-light w-100 border border-light border-2 rounded-pill">
                    Войти
                </button>
            </a>
            <a href="/sign-up" class="nav-link">
                <button type="button" class="btn btn-light w-100 border border-light border-2 rounded-pill ms-2">
                    Зарегистрироваться
                </button>
            </a>
        `
}

async function initHeader() {
    await displayHeaderTemplate()
    await displayUserInfo()
}

await initHeader()

