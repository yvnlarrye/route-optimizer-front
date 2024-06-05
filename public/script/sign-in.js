import { loadConfig } from "./utils.js"

loadConfig().then(config => {
    if (!config) {
        console.log('Config loading error')
        return
    };

    const loginButton = document.getElementById("loginButton")
    const passwordInput = document.getElementById("password")
    const usernameInput = document.getElementById("username")
    let errorMessageElement = document.getElementById("err_msg")


    loginButton.addEventListener('click', async function () {
        const request = await fetch(`${config.spring_app_address}/api/v1/auth/sign-in`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*"
            },
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value,
            })
        })

        if (request.ok) {
            const response = await request.json()
            localStorage.setItem("token", response.token)
            window.location.href = "/"
        } else {
            errorMessageElement.innerText = "Неверный логин или пароль"
        }
    })

})