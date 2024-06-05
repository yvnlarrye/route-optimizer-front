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

            function createDemand(addressIndex) {
                let demand = ''
                if (cvrpProblemRadio.checked) {
                    demand = `
                    <div class="my-3 d-flex justify-content-start align-items-center">
                        <span class="me-4">Необходимо поставить:</span>
                        <input value="1" data-address-index="${addressIndex}" type="number" min="1" class="w-25 form-control border-white bg-black border border-light border-2 rounded-pill text-white">
                    </div>
                    `
                }
                return demand
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
                    ${createDemand(index)}
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

            return
        }
    }
    addressesOutput.innerHTML = 'Добавленные адреса отобразятся здесь'
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
                <input type="number" min="1" class="w-100 form-control border-white bg-black border border-light border-3 rounded-pill text-white" id="vehicle-count">
            </div>
            `
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
}


await init()