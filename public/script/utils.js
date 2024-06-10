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
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function getUniqueFilename(userId) {
    const timestamp = Date.now();
    return `solution_${timestamp}_${userId}.xlsx`;
}

export async function downloadFile() {
    const config = await loadConfig()
    const response = await fetch(`${config.spring_app_address}/api/v1/solution/download`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            name: null,
            solutionJson: document.getElementById("save-solution-btn").value.replace('&quot;', /"/g)
        })
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute('download', 'solution.xlsx');

        document.body.appendChild(link);
        link.click();

        window.URL.revokeObjectURL(url);
    }
}