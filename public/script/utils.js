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
        method: 'GET',
        headers: {
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
            name: "",
            solutionJson: document.getElementById("solution-data-json").value.replace('&quot;', /"/g)
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

export function formatDateTime(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export async function initMap(solution) {
    ymaps.ready(init);

    function init() {
        let centerCoords = solution.routes[0].nodes[0].location
        var myMap = new ymaps.Map("map", {
            center: [centerCoords.lat, centerCoords.lon],
            zoom: 10
        });

        solution.routes.forEach(route => {
            var placemarks = [];

            let currentRouteColor = getRandomColor()

            route.nodes.forEach((node, index) => {
                let coords = [node.location.lat, node.location.lon];
                var placemark = new ymaps.Placemark(coords, {
                    iconContent: (index + 1).toString()
                }, {
                    preset: 'islands#blueCircleIconWithCaption',
                    iconColor: currentRouteColor
                });

                placemarks.push(coords);
                if (index != route.nodes.length - 1) {
                    myMap.geoObjects.add(placemark);
                }
            });

            var multiRoute = new ymaps.multiRouter.MultiRoute({
                referencePoints: placemarks,
                params: {
                    routingMode: 'auto'
                }
            }, {
                wayPointStartIconLayout: 'default#image',
                wayPointFinishIconLayout: 'default#image',
                wayPointIconLayout: 'default#image',
                wayPointStartIconImageHref: '',
                wayPointFinishIconImageHref: '',
                wayPointIconImageHref: '',
                routeStrokeWidth: 5,
                routeActiveStrokeColor: currentRouteColor
            });

            myMap.geoObjects.add(multiRoute);
        })
    }

}