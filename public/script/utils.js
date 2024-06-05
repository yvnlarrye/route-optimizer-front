
export async function loadConfig() {
    const response = await fetch('/config.json');
    if (response.ok) {
        return await response.json();
    } else {
        console.error('Failed to load config');
        return null;
    }
}

export async function getCurrentUser() {
    const config = await loadConfig()
    const response = await fetch(`${config.spring_app_address}/api/v1/current-user`, {
        headers: {
            method: 'GET',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        return await response.json();
    }
    return null
}