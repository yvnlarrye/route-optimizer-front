import { getCurrentUser } from "./utils.js"
import { loadConfig } from "./utils.js";
import { formatDateTime } from "./utils.js";
import { initMap } from "./utils.js";
import { downloadFile } from "./utils.js";

const config = await loadConfig()

async function getUserSolutions() {
    let user = await getCurrentUser()
    const response = await fetch(`${config.spring_app_address}/api/v1/solution/user/${user.id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        return await response.json();
    }
    throw new Error("Error while trying to get user solutins")
}

async function getSolution(id) {
    const response = await fetch(`${config.spring_app_address}/api/v1/solution/${id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        return await response.json();
    }
    throw new Error("Error while trying to get user solutins")
}

async function removeSolution(solutionId) {
    const response = await fetch(`${config.spring_app_address}/api/v1/solution/${solutionId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        return await response.json();
    }
    throw new Error("Error while trying to remove solution")
}

async function init() {

    let solutionListElement = document.getElementById('solution-list')
    let solutionResponse = await getUserSolutions()

    if (solutionResponse.solutions.length) {
        solutionResponse.solutions.forEach((solution, index) => {
            let solutionData = JSON.parse(solution.solutionJson)
    
            solutionListElement.innerHTML += `
                <div data-id="${solution.id}" class="btn btn-outline-light border-0 p-0 m-0 w-100 solution">
                    <div class="${(index != solutionResponse.solutions.length - 1) ? 'border-bottom border-white' : ''} py-3 px-3 position-relative">
                        <i data-id="${solution.id}" class="rm-solution bi bi-x position-absolute top-0 end-0 fs-3 z-index-20"></i>
                        <div class="fs-5 fw-bold text-start">${index + 1}. ${solution.name}</div>
                        <div class="d-flex justify-content-between">
                            <span>${formatDateTime(solution.createdAt)}</span>
                            <span>${solutionData.problem_type}</span>
                        </div>
                    </div>
                </div>
            `
            document.querySelectorAll('.rm-solution').forEach(elm => {
                elm.addEventListener('click', async function (event) {
                    event.stopPropagation()
                    await removeSolution(elm.dataset.id)
                    document.querySelector(`[data-id="${elm.dataset.id}"]`).remove()
                })
            })
        })
    
        let solutions = document.querySelectorAll('.solution')
        solutions.forEach(element => {
            element.addEventListener('click', async () => {
                solutions.forEach(elm => {
                    if (elm.classList.contains('btn-light')) {
                        elm.classList.remove('btn-light')
                        elm.classList.add('btn-outline-light')
                    }
                })

                async function displaySolutionDetails() {
                    let solution = await getSolution(element.dataset.id)
                    let solutionDetailsElement = document.getElementById('solution-details')
                    solutionDetailsElement.innerHTML = `
                        <div id="map-container">
                            <div id="map" style="width: 600px; height: 400px" class="w-100"></div>
                        </div>
                        <div class="mt-3 w-100" id="solution-actions">
                            <div class="d-flex justify-content-center">
                                <input value="${solution.solutionJson.replace(/"/g, '&quot;')}" type="hidden" id="solution-data-json">
                                <button id="download-solution" type="button" class="btn btn-outline-light d-flex align-items-center px-5 border border-white border-3 rounded-pill">
                                    <i class="bi bi-filetype-xlsx fs-4 me-3"></i>
                                    <span>Скачать решение</span>
                                </button>
                            </div>
                            <div class="mt-3 w-100 d-flex justify-content-center" id="solution-name-block"></div>
                        </div>
                    `
                    document.getElementById("download-solution").addEventListener('click', downloadFile)
                    initMap(JSON.parse(solution.solutionJson))
                }

                if (element.classList.contains('btn-outline-light')) {
                    element.classList.remove('btn-outline-light')
                    element.classList.add('btn-light')

                    await displaySolutionDetails()
                }
            })
        })
    } else {
        solutionListElement.innerHTML = `
        <div class="text-center w-100 py-3">
            <span>У вас нет сохранённых решений</span>
        </div>
        `
    }
}


await init()


