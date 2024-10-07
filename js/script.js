// database desde json
let plans = [];
let addons = [];

const isSubdirectory = window.location.pathname.includes('pages/');
const jsonPath = isSubdirectory ? '../js/servicios.json' : './js/servicios.json';

fetch(jsonPath)
    .then(resp => resp.json())
    .then(data => {
        plans = data.plans;
        addons = data.addons;

        //carga detalles de planes
        loadPlanDetails();

        // verificar si el contenedor de los planes existe antes de cargar los planes
        const plansContainer = document.getElementById('plans-container');
        if (plansContainer) {
            loadPlans();
            loadAddons();
        }
    })
    .catch(error => console.error("Error al cargar los servicios:", error));

// var globales
let selectedPlan = JSON.parse(localStorage.getItem('selectedPlan')) || null;
let selectedAddons = JSON.parse(localStorage.getItem('selectedAddons')) || [];

// carga de planes
function loadPlans() {
    const plansContainer = document.getElementById('plans-container');
    plansContainer.innerHTML = ''; // limpia contenedor

    plans.forEach(plan => {
        const button = document.createElement('button');
        button.textContent = `${plan.name} / $${plan.price.toLocaleString('es-CL')}`;
        button.classList.add('plan-button');
        
        // deja botón seleccionado
        if (selectedPlan && selectedPlan.id === plan.id) {
            button.classList.add('selected');
        }

        button.onclick = () => {
            selectPlan(plan);
            // elimina la clase 'selected' de todos los botones
            document.querySelectorAll('.plan-button').forEach(btn => btn.classList.remove('selected'));
            // agrega la clase 'selected' solo al botón seleccionado
            button.classList.add('selected');
            // habilita los botones de addons
            enableAddons(true);
        };
        plansContainer.appendChild(button);
    });
}

// seleccionar un plan
function selectPlan(plan) {
    selectedPlan = plan;
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    updateCartSummary();
}

// cargar addons
function loadAddons() {
    const addonsContainer = document.getElementById('addons-container');
    addonsContainer.innerHTML = ''; // limpia contenedor

    addons.forEach(addon => {
        const button = document.createElement('button');
        button.textContent = `${addon.name} - $${addon.price.toLocaleString('es-CL')}`;
        button.classList.add('addon-button');

        // deshabilita los botones si no hay plan seleccionado
        if (!selectedPlan) {
            button.disabled = true;
        } else if (selectedAddons.find(a => a.id === addon.id)) {
            button.classList.add('selected');
        }

        button.onclick = () => {
            if (selectedPlan) { // solo permite agregar si hay un plan
                toggleAddon(addon);
                // toggle clase 'selected' en el botón actual
                button.classList.toggle('selected');
            }
        };
        addonsContainer.appendChild(button);
    });
}

// agregar/remover addons
function toggleAddon(addon) {
    const index = selectedAddons.findIndex(a => a.id === addon.id);
    if (index === -1) {
        selectedAddons.push(addon);
    } else {
        selectedAddons.splice(index, 1);
    }
    localStorage.setItem('selectedAddons', JSON.stringify(selectedAddons));
    updateCartSummary();
}

// eliminar el plan seleccionado y addons desde el resumen
function removeSelectedPlan() {
    selectedPlan = null;
    selectedAddons = []; // vacía los addons seleccionados
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('selectedAddons');
    updateCartSummary();
    loadPlans(); // recargar los botones de planes
    loadAddons(); // recargar los botones de addons
    enableAddons(false); // deshabilitar los addons si no hay plan seleccionado
}

// habilitar o deshabilitar los addons
function enableAddons(enable) {
    const addonButtons = document.querySelectorAll('.addon-button');
    addonButtons.forEach(button => {
        button.disabled = !enable;
    });
}

// actualizar el resumen del carrito
function updateCartSummary() {
    const summaryContainer = document.getElementById('cart-summary');


    let total = 0;
    let summaryHTML = '';

    if (selectedPlan) {
        total += selectedPlan.price;
        summaryHTML += `<p><strong>Plan seleccionado:</strong> ${selectedPlan.name} - $${selectedPlan.price.toLocaleString('es-CL')} <button onclick="removeSelectedPlan()">X</button></p>`;
    } else {
        summaryHTML += `<p class="empty-cart">No has seleccionado ningún plan.</p>`;
    }

    if (selectedAddons.length > 0) {
        summaryHTML += `<p><strong>Adicionales seleccionados:</strong></p><ul>`;
        selectedAddons.forEach(addon => {
            total += addon.price;
            summaryHTML += `<li>${addon.name} - $${addon.price.toLocaleString('es-CL')}</li>`;
        });
        summaryHTML += `</ul>`;
    } else {
        summaryHTML += `<p class="empty-cart">No has seleccionado ningún addon.</p>`;
    }

    summaryHTML += `<p><strong>Total:</strong> $${total.toLocaleString('es-CL')}</p>`;
    summaryContainer.innerHTML = summaryHTML;
}

// mostrar el resumen en el checkout
function showSummary() {
    
    let total = selectedPlan ? selectedPlan.price : 0;
    const summary = document.getElementById('summary');

    if (selectedPlan) {
        summary.innerHTML = `<p><strong>Plan:</strong> ${selectedPlan.name} - $${selectedPlan.price.toLocaleString('es-CL')}</p>`;
    } else {
        summary.innerHTML = `<p>No has seleccionado ningún plan.</p>`;
    }

    if (selectedAddons.length > 0) {
        summary.innerHTML += `<p><strong>Adicionales:</strong></p><ul>`;
        selectedAddons.forEach(addon => {
            total += addon.price;
            summary.innerHTML += `<li>${addon.name} - $${addon.price.toLocaleString('es-CL')}</li>`;
        });
        summary.innerHTML += `</ul>`;
    } else {
        summary.innerHTML += `<p>No has seleccionado ningún addon.</p>`;
    }

    summary.innerHTML += `<p><strong>Total: $${total.toLocaleString('es-CL')}</strong></p>`;
}

// mostrar los detalles de la compra en la página de éxito
function showPurchaseDetails() {
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));
    const selectedAddons = JSON.parse(localStorage.getItem('selectedAddons')) || [];
    let total = selectedPlan ? selectedPlan.price : 0;
    const details = document.getElementById('purchase-details');

    if (selectedPlan) {
        details.innerHTML = `<p><strong>Plan:</strong> ${selectedPlan.name}</p>`;
    }

    if (selectedAddons.length > 0) {
        details.innerHTML += `<p><strong>Adicionales</strong>:</p><ul>`;
        selectedAddons.forEach(addon => {
            total += addon.price;
            details.innerHTML += `<li>${addon.name}</li>`;
        });
        details.innerHTML += `</ul>`;
    }

    details.innerHTML += `<p><strong>Total: $${total}</strong></p>`;
}


// inicialización
window.onload = function() {
    const plansContainer = document.getElementById('plans-container');
    const continueButton = document.getElementById('continue-btn');

    if (plansContainer && continueButton) {
        // solo carga los planes y addons si estamos en una página donde se visualizan los planes
        //! evitar errores en paginas checkout y success
        loadPlans();
        loadAddons();
        updateCartSummary();

        // deshabilitar los addons inicialmente si no hay plan seleccionado
        if (!selectedPlan) {
            enableAddons(false);
        }

        continueButton.onclick = () => {
            // obtener el plan y los addons seleccionados
            const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));
            const selectedAddons = JSON.parse(localStorage.getItem('selectedAddons')) || [];

            let total = selectedPlan ? selectedPlan.price : 0;

            // sumar el precio de los addons seleccionados
            selectedAddons.forEach(addon => {
                total += addon.price;
            });

            // verificar si el total es mayor a 0
            //! evitar compra sin nada agregado
            if (total > 0) {
                // mostrar alerta de confirmación
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: "Vas a continuar con la compra. ¿Deseas proceder?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, continuar',
                    cancelButtonText: 'No, cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // redirigir a la página de checkout si se confirma
                        window.location.href = 'pages/checkout.html';
                    }
                });
            } else {
                // mostrar una alerta si no hay ítems seleccionados
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Por favor selecciona un plan o adicional antes de continuar con la compra.'
                });
            }
        };
    }

    if (document.getElementById('checkout-form')) {
        showSummary();
        document.getElementById('checkout-form').onsubmit = (e) => {
            e.preventDefault(); // evitar el envío inmediato del formulario
    
            // mostrar alerta de compra exitosa
            Swal.fire({
                title: '¡Compra exitosa!',
                text: 'Tu compra ha sido realizada con éxito.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    // redirigir a la página success
                    window.location.href = 'success.html';
                }
            });
        };
    }

    if (document.getElementById('purchase-details')) {
        showPurchaseDetails();
    }
};


//borrar carrito al volver
const backButton = document.getElementById('back-to-store-btn');
if (backButton) {
    backButton.onclick = function() {
        localStorage.removeItem('selectedPlan');
        localStorage.removeItem('selectedAddons');
        window.location.href = 'index.html';
    };
}

// cargar detalle de planes desde json
function loadPlanDetails() {
    const planCardsContainer = document.getElementById('plan-cards-container');
    
    // verificar si el contenedor existe en la página actual
    if (!planCardsContainer) {
        return; // no hacer nada si no existe
    }

    planCardsContainer.innerHTML = ''; // limpiar cualquier contenido previo

    plans.forEach(plan => {
        const card = document.createElement('div');
        card.classList.add('plan-detail-card');

        card.innerHTML = `
            <h3>${plan.name}</h3>
            <p>Acceso al bot de resumen clínico para consultas de salud mental.</p>
            <p><strong>Incluye:</strong> ${plan.conversations} conversaciones / resúmenes</p>
            <p><strong>Vigencia:</strong> ${plan.vigencia}</p>
            <p><strong>Precio:</strong> $${plan.price.toLocaleString('es-CL')} CLP</p>
        `;

        planCardsContainer.appendChild(card);
    });
}