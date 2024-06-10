import { loadConfig } from "./utils.js"
import { downloadFile } from "./utils.js"
import { initMap } from "./utils.js"

const addAddressBtn = document.getElementById('add-address-btn')
const addressInput = document.getElementById('address')
const tspProblemRadio = document.getElementById("tsp-problem")
const cvrpProblemRadio = document.getElementById("cvrp-problem")

function isFullAddressFilled() {
    return addressInput.value != null && addressInput.value != ""
}

function displayAddresses() {
    const addressesOutput = document.getElementById('addresses')

    let addressesJson = localStorage.getItem("addresses")
    if (addressesJson) {
        let addressesList = JSON.parse(addressesJson)

        if (addressesList.length) {
            addressesOutput.innerHTML = null

            function createAddressDetails(addressIndex) {
                let demands = ''
                if (cvrpProblemRadio.checked) {
                    demands = `
                        <div class="col my-3 d-flex align-items-center">
                            <span class="me-4">Необходимо поставить:</span>
                            <input value="1" data-address-index="${addressIndex}" type="number" min="1" class="demand form-control border-white bg-black border border-light border-2 rounded-pill text-white">
                        </div>
                    `
                }
                return `
                    <div class="row align-items-center">
                        ${demands}
                        <div class="col form-check form-switch d-flex justify-content-end">
                            <div class="me-2">
                                <label class="form-check-label">Склад</label>
                                <input data-address-index="${addressIndex}" class="is-depot-cb bg-dark form-check-input" type="checkbox" role="switch">
                            </div> 
                        </div> 
                    </div> 
                    `
            }

            addressesList.forEach((address, index) => {
                addressesOutput.innerHTML += `
                <div class="py-4 mb-2 ${(index != addressesList.length - 1) ? 'border-bottom border-white' : ''}">
                    <div class="fs-5 d-flex align-items-center">
                        <span>${address}</span>
                        <button data-address-index="${index}" type="button" class="ms-3 rm-address-btn btn btn-outline-danger btn-sm h-50">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                    ${createAddressDetails(index)}
                </div>
            `
            })

            document.querySelectorAll(".rm-address-btn").forEach(btn => {
                btn.addEventListener('click', () => {
                    let addressesList = JSON.parse(localStorage.getItem("addresses"))
                    addressesList.splice(btn.dataset.addressIndex, 1)
                    localStorage.setItem("addresses", JSON.stringify(addressesList))
                    displayAddresses()
                })
            })

            let checkBoxes = document.querySelectorAll('.is-depot-cb')
            checkBoxes.forEach((checkBox, index) => {
                checkBox.addEventListener('change', (event) => {
                    let input = event.target
                    if (input.checked) {
                        checkBoxes.forEach((cb, i) => {
                            if (index != i) {
                                cb.checked = false
                            }
                        })
                    }
                })
            })

            return
        }
    }
    addressesOutput.innerHTML = 'Добавленные адреса отобразятся здесь'
}

function validateVehicles() {
    let vehicleCapacityInput = document.getElementById('vehicle-capacity')
    let vehicleCountInput = document.getElementById("vehicle-count")

    vehicleCountInput.addEventListener('input', (event) => {
        const input = event.target
        if (input.value != null && input.value != '') {
            vehicleCapacityInput.disabled = false
        } else {
            vehicleCapacityInput.disabled = true
            vehicleCapacityInput.value = null
        }
    })

    vehicleCapacityInput.addEventListener('input', function (event) {
        let vehicleCount = vehicleCountInput.value
        const input = event.target;
        const value = input.value;

        const numbers = value.replace(/\s/g, '').split(',');

        const isValidFormat = numbers.every(num => num.match(/^\d*$/));

        if (!isValidFormat || numbers.length > vehicleCount) {
            input.value = numbers.slice(0, vehicleCount).join(', ');
        }

        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] && !/^\d+$/.test(numbers[i])) {
                input.value = numbers.slice(0, i).join(',');
                break;
            }
        }
    });
}

function validateAddresses() {
    let addresses = JSON.parse(localStorage.getItem('addresses'))
    if (!addresses || addresses.length == 0 || addresses.length < 3) {
        throw new Error('Необходимо добавить хотя бы 3 адреса')
    }
}

function addressesListForRequest() {
    let addressesListJson = localStorage.getItem('addresses')
    let addressesList = JSON.parse(addressesListJson)
    let result = []
    addressesList.forEach(addrStr => {
        result.push({
            full_address: addrStr,
            type: "oneStringAddress"
        })
    })

    return result
}


async function solveTSP() {
    let processingSpinner = document.getElementById('processing-spinner')
    processingSpinner.innerHTML = `
        <div class="spinner-border text-light" role="status">
            <span class="visually-hidden"></span>
        </div>
    `
    const config = await loadConfig()
    const response = await fetch(`${config.spring_app_address}/api/v1/find/tsp`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            addresses: addressesListForRequest(),
            optimization_type: document.querySelector('input[name="optimization-type"]:checked').value,
            depot: document.querySelector('.is-depot-cb:checked').dataset.addressIndex
        })
    });

    processingSpinner.innerHTML = null
    if (response.ok) {
        return await response.json();
    }
    throw new Error('Не удалось решить TSP. Попробуйте указать другие данные.')
}

function validateChoosenDepot() {
    if (!document.querySelector('.is-depot-cb:checked')) {
        throw new Error('Выберите точку склада.')
    }
}

function validateCvrpInputs() {
    let errors = []

    document.querySelectorAll('.demand').forEach(demand => {
        if (demand.value == null || demand.value == '') {
            errors.push('Укажите количество поставок для всех адресов.')
            return
        }
    })

    var vehicleCountInput = document.getElementById('vehicle-capacity')
    var vehicleCountInput = document.getElementById("vehicle-count")

    if (vehicleCountInput.value == null || vehicleCountInput.value == '') {
        errors.push('Укажите количество транспортных средств.')
    }

    if (vehicleCountInput.value == null || vehicleCountInput.value == '') {
        errors.push('Укажите вместимость транспортных средств.')
    }

    if (errors.length) {
        throw new Error(errors.join('<br>'))
    }
}

async function solveCVRP() {
    validateCvrpInputs()
    let processingSpinner = document.getElementById('processing-spinner')
    processingSpinner.innerHTML = `
        <div class="spinner-border text-light" role="status">
            <span class="visually-hidden"></span>
        </div>
    `
    const config = await loadConfig()
    const response = await fetch(`${config.spring_app_address}/api/v1/find/cvrp`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            addresses: addressesListForRequest(),
            optimization_type: document.querySelector('input[name="optimization-type"]:checked').value,
            demands: Array.from(document.querySelectorAll('.demand')).map(demand => demand.value),
            vehicle_number: document.getElementById("vehicle-count").value,
            vehicle_capacities: Array.from(document.getElementById('vehicle-capacity').value.split(',')).map(capacity => parseInt(capacity.trim())),
            depot: document.querySelector('.is-depot-cb:checked').dataset.addressIndex
        })
    });

    processingSpinner.innerHTML = null
    if (response.ok) {
        return await response.json();
    }
    throw new Error('Не удалось решить CVRP. Попробуйте указать другие данные.')
}


function handleSolution(solution) {
    let solutionArea = document.getElementById('solution-area')

    solutionArea.innerHTML = `
        <h1 class="text-white text-center py-3">Результаты</h1>
        <div id="map-container">
            <div id="map" style="width: 600px; height: 600px" class="w-100 px-5"></div>
        </div>
        <div class="my-4 w-100" id="solution-actions">
            <div class="d-flex justify-content-center">
                <input value="${JSON.stringify(solution).replace(/"/g, '&quot;')}" type="hidden" id="solution-data-json">
                <button id="download-solution" type="button" class="btn btn-outline-light d-flex align-items-center px-5 border border-white border-3 rounded-pill">
                    <i class="bi bi-filetype-xlsx fs-2 me-3"></i>
                    <span class="fs-5">Скачать решение</span>
                </button>
                <button id="save-solution-btn" type="button" class="ms-2 btn btn-outline-primary d-flex align-items-center px-5 border border-primary border-3 rounded-pill">
                    <i class="bi bi-download fs-4 me-2"></i>
                    <span class="fs-5">Сохранить решение</span>
                </button>
            </div>
            <div class="mt-3 w-100 d-flex justify-content-center" id="solution-name-block"></div>
        </div>
    `

    
    function addListenerToSaveBtn() {
        document.getElementById("download-solution").addEventListener('click', downloadFile)

        const saveSolutionBtn = document.getElementById("save-solution-btn")
        saveSolutionBtn.addEventListener('click', () => {

            let solutionNameBlock = document.getElementById("solution-name-block")
            solutionNameBlock.innerHTML = `
                <div class="w-50">
                    <label class="form-label ms-2" for="solution-name">Название</label>
                    <div class="input-group ms-2">
                        <input type="text" class="me-2 form-control border-white bg-black border border-light border-3 rounded-pill text-white" id="solution-name">
                        <button class="btn btn-outline-success rounded-0 border border-3 border-success" type="button" id="confirm-save">
                            <i class="bi bi-check2"></i>
                        </button>
                        <button class="btn btn-outline-danger rounded-0 border border-3 border-danger" type="button" id="cancel-save">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            `
            
            document.getElementById('confirm-save').addEventListener('click', async () => {
                const config = await loadConfig()
                const response = await fetch(`${config.spring_app_address}/api/v1/solution`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        name: document.getElementById('solution-name').value,
                        solutionJson: document.getElementById("solution-data-json").value.replace('&quot;', /"/g)
                    })
                });

                if (response.ok) {
                    if (solutionNameBlock) {
                        solutionNameBlock.innerHTML = null
                    }
                    saveSolutionBtn.disabled = true
                    saveSolutionBtn.innerHTML = `
                        <i class="bi bi-check2 fs-3 me-1"></i>
                        <span class="fs-5">Сохранено</span>
                    `
                }
            })

            document.getElementById("cancel-save").addEventListener('click', () => {
                if (solutionNameBlock) {
                    solutionNameBlock.innerHTML = null
                    addListenerToSaveBtn()
                }
            })
        })
    }

    initMap(solution)
    addListenerToSaveBtn()
}


async function listenOptimizeRouteBtn() {
    const optimizeBtn = document.getElementById("optimize-btn")
    const errMessage = document.getElementById("err-message")
    optimizeBtn.addEventListener('click', async () => {
        errMessage.innerHTML = null
        optimizeBtn.disabled = true
        try {
            validateAddresses()
            validateChoosenDepot()
            if (tspProblemRadio.checked) {
                var solution = await solveTSP()
            } else if (cvrpProblemRadio.checked) {
                validateCvrpInputs()
                var solution = await solveCVRP()
            }

            handleSolution(solution)

        } catch (err) {
            errMessage.innerHTML = `
                <i class="bi bi-exclamation-octagon me-1"></i>
                <span>${err.message}</span>
            `
        }
        optimizeBtn.disabled = false
    })
}


async function init() {
    addAddressBtn.addEventListener('click', () => {
        if (isFullAddressFilled()) {

            var addressesList = []

            let addressesJson = localStorage.getItem("addresses")
            if (addressesJson) {
                addressesList = JSON.parse(addressesJson)
            }

            addressesList.push(addressInput.value)
            localStorage.setItem("addresses", JSON.stringify(addressesList))

            displayAddresses()
            addressInput.value = null
        }
    })

    let cvrpData = document.getElementById('cvrp-data')
    cvrpProblemRadio.addEventListener('change', () => {
        if (cvrpProblemRadio.checked) {
            cvrpData.innerHTML = `
            <div class="my-3 w-25">
                <label class="form-label">Количество ТС</label>
                <input required type="number" min="1" class="w-100 form-control border-white bg-black border border-light border-3 rounded-pill text-white" id="vehicle-count">
            </div>
            <div class="my-3 w-100">
                <label class="form-label">Вместимость ТС:</label>
                <input disabled required type="text" min="1" class="w-100 form-control border-white bg-black border border-light border-3 rounded-pill text-white" id="vehicle-capacity">
                <div id="capacityHelp" class="form-text text-white opacity-50">Например: 1, 3, 4, 5, 2</div>
            </div>
            `
            validateVehicles()
            displayAddresses()
        }
    })

    tspProblemRadio.addEventListener('change', () => {
        if (tspProblemRadio.checked) {
            cvrpData.innerHTML = null
            displayAddresses()
        }
    })

    displayAddresses()
    await listenOptimizeRouteBtn()
}


await init()