import { loadConfig } from "./utils.js"

loadConfig().then(config => {
    if (!config) {
        console.log('Config loading error')
        return
    }

    const registerButton = document.getElementById("registerButton")
    const passwordInput = document.getElementById("password")
    const usernameInput = document.getElementById("username")
    const repeatPassword = document.getElementById("repeatPassword")

    let errorMessageElement = document.getElementById("err_msg")
    const BAD_REQUEST = 400


    registerButton.addEventListener('click', async function () {
        const request = await fetch(`${config.spring_app_address}/api/v1/auth/sign-up`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
            },
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value,
            })
        })
        const response = await request.json()
        if (request.ok) {
            localStorage.setItem("token", response.token)
            window.location.href = "/"
        } else if (request.status === BAD_REQUEST) {
            let errorOutput = ""
            response.errors.forEach(error => {
                errorOutput += error + '.<br>'
            });
            errorMessageElement.innerHTML = errorOutput
        } else if (request.status == 409) {
            errorMessageElement.innerHTML = "Пользователь с таким именем уже зарегистрирован"
        }
    })

    repeatPassword.addEventListener("input", () => {
        if (passwordInput.value == repeatPassword.value) {
            registerButton.disabled = false
        } else {
            registerButton.disabled = true
        }
    })

    repeatPassword.addEventListener("change", () => {
        errorMessageElement.innerHTML = null
        if (passwordInput.value != repeatPassword.value) {
            errorMessageElement.innerHTML += "Пароли не совпадают<br>"
        }
    })

})