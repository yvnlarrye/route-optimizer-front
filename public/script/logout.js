import { loadConfig } from "./utils.js"

document.addEventListener("DOMContentLoaded", async () => {
    const config = await loadConfig()
    try {
        const response = await fetch(`${config.spring_app_address}/api/v1/auth/logout`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (response.ok) {
            localStorage.clear()
        } else {
            console.error('Ошибка при запросе на logout');
        }
        window.location.href = "/";
    } catch (error) {
        console.error('Ошибка при выполнении fetch:', error);
    }
});
