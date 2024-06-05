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
    const passCheckerMessage = document.getElementById("passCheckerMessage")

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
                errorOutput += '<i class="bi bi-dot me-2"></i>' + error + '.<br>'
            });

            errorMessageElement.innerHTML = errorOutput
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
        if ((passwordInput.value == repeatPassword.value)) {
            passCheckerMessage.innerText = ""
        } else {
            passCheckerMessage.innerText = "Пароли не совпадают"
        }
    })

})