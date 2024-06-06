import { loadConfig } from "./utils.js"

const addAddressBtn = document.getElementById('add-address-btn')
const confirmAddressBtn = document.getElementById('confirm-address-btn')

const addressInput = document.querySelector('input[name="address"]')

let checkedProblemType = document.querySelector('input[name="problem-type"]:checked')
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
                        <button data-address-index="${index}" type="button" class="rm-address-btn btn btn-outline-danger btn-sm h-50">
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
    let addresses = localStorage.getItem('addresses')
    if (!addresses || addresses.length == 0) {
        throw new Error('Необходимо добавить хотя бы 3 адреса')
    }
}

function addressesListForRequest() {
    let addressesListJson = localStorage.getItem('addresses')
    let addressesList = JSON.parse(addressesListJson)
    let result = []
    addressesList.forEach(addrStr => {
        result.push({address: addrStr})
    })

    return result
}

async function solveTSP() {
    const config = await loadConfig()
    const response = await fetch(`${config.spring_app_address}/api/v1/optimize/tsp`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            addresses: addressesListForRequest(),
            depot: document.querySelector('.is-depot-cb:checked').dataset.addressIndex
        })
    });

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

    const config = await loadConfig()
    const response = await fetch(`${config.spring_app_address}/api/v1/optimize/cvrp`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            addresses: addressesListForRequest(),
            demands: Array.from(document.querySelectorAll('.demand')).map(demand => demand.value),
            vehicle_number: document.getElementById("vehicle-count").value,
            vehicle_capacities: Array.from(document.getElementById('vehicle-capacity').value.split(',')).map(capacity => parseInt(capacity.trim())),
            depot: document.querySelector('.is-depot-cb:checked').dataset.addressIndex
        })
    });

    if (response.ok) {
        return await response.json();
    }
    throw new Error('Не удалось решить CVRP. Попробуйте указать другие данные.')
}


async function listenOptimizeRouteBtn() {
    const optimizeBtn = document.getElementById("optimize-btn")
    const errMessage = document.getElementById("err-message")
    optimizeBtn.addEventListener('click', async () => {
        errMessage.innerHTML = null
        try {
            validateAddresses()
            validateChoosenDepot()
            if (tspProblemRadio.checked) {
                await solveTSP()
            } else if (cvrpProblemRadio.checked) {
                validateCvrpInputs()
                await solveCVRP()
            }
        } catch (err) {
            errMessage.innerHTML = `
                <i class="bi bi-exclamation-octagon me-1"></i>
                <span>${err.message}</span>
            `
        }
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