
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

export function getRandomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);

    let rHex = r.toString(16).padStart(2, '0');
    let gHex = g.toString(16).padStart(2, '0');
    let bHex = b.toString(16).padStart(2, '0');

    return rHex + gHex + bHex;
}