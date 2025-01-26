document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado y analizado');

    // Inicializar el menú lateral
    const menuBtn = document.getElementById('menu-btn');
    const menuLateral = document.getElementById('menu-lateral');

    if (menuBtn && menuLateral) {
        menuBtn.addEventListener('click', () => {
            menuLateral.classList.toggle('active');
        });
    }

    // Cargar las noticias desde JSON
    fetch('data/noticias.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error de red: ' + response.statusText);
            }
            return response.json();
        })
        .then(noticias => {
            const noticiasDiv = document.getElementById('contenido-noticias');
            if (noticiasDiv) {
                noticias.forEach(noticia => {
                    const noticiaElement = document.createElement('div');
                    noticiaElement.innerHTML = `<h3>${noticia.titulo}</h3><p>${noticia.contenido}</p>`;
                    noticiasDiv.appendChild(noticiaElement);
                });
            }
        })
        .catch(error => console.log('Error al cargar las noticias: ' + error));

    // Validación del formulario de presupuesto
    const formularioPresupuesto = document.getElementById('formulario-presupuesto');
    if (formularioPresupuesto) {
        const nombre = document.getElementById('nombre');
        const apellidos = document.getElementById('apellidos');
        const telefono = document.getElementById('telefono');
        const email = document.getElementById('email');
        const producto = document.getElementById('producto');
        const plazo = document.getElementById('plazo');
        const extras = formularioPresupuesto.querySelectorAll('input[type="checkbox"]');
        const presupuestoFinal = document.getElementById('presupuesto-final');

        const validarDatos = () => {
            let valid = true;
            const regexNombre = /^[a-zA-Z\s]{1,15}$/;
            const regexApellidos = /^[a-zA-Z\s]{1,40}$/;
            const regexTelefono = /^\d{9}$/;
            const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!regexNombre.test(nombre.value)) valid = false;
            if (!regexApellidos.test(apellidos.value)) valid = false;
            if (!regexTelefono.test(telefono.value)) valid = false;
            if (!regexEmail.test(email.value)) valid = false;

            console.log('Validaciones:', valid);
            return valid;
        };

        const calcularPresupuesto = () => {
            let total = 0;

            switch (producto.value) {
                case 'producto1':
                    total += 100;
                    break;
                case 'producto2':
                    total += 200;
                    break;
                case 'producto3':
                    total += 300;
                    break;
                default:
                    total = 0;
            }

            // Convertir el valor de plazo a número
            const plazoNumero = parseFloat(plazo.value);
            if (isNaN(plazoNumero) || plazoNumero < 0) {
                presupuestoFinal.value = 'Error en el ingreso de plazo';
                return;
            }

            total -= (plazoNumero >= 6) ? total * 0.1 : 0; // 10% de descuento si el plazo es mayor o igual a 6 meses

            extras.forEach(extra => {
                const extraCosto = parseFloat(extra.value);
                if (!isNaN(extraCosto)) {
                    total += extraCosto;
                }
            });

            // Si el total no es un número, muestra un error
            if (isNaN(total)) {
                presupuestoFinal.value = 'Error en el cálculo';
            } else {
                presupuestoFinal.value = `$${total.toFixed(2)}`;
                console.log('Presupuesto calculado:', total);
            }
        };

        formularioPresupuesto.addEventListener('input', () => {
            console.log('Evento de input detectado');
            if (validarDatos()) {
                calcularPresupuesto();
            } else {
                presupuestoFinal.value = '';
            }
        });

        formularioPresupuesto.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Evento de submit detectado');
            if (validarDatos()) {
                calcularPresupuesto();
                alert('Formulario enviado exitosamente.');
                formularioPresupuesto.reset(); // Reinitializar los campos del formulario
                presupuestoFinal.value = ''; // Restablecer el campo del presupuesto final
            } else {
                alert('Por favor, verifica que todos los campos estén correctamente llenados.');
            }
        });
    }

    // Inicialización de la carta
    var map = L.map('mapa').setView([45.3949, -72.7297], 13); // Coordenadas aproximadas de Rue Denison Ouest
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(map);

    var marker = L.marker([45.3949, -72.7297]).addTo(map)
        .bindPopup('Ubicación de la Empresa')
        .openPopup();

    function geocodeAddress(address, callback) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    callback([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                } else {
                    alert("Adresse non trouvée");
                }
            })
            .catch(error => console.error('Erreur:', error));
    }

    function calcularRuta(latCliente, lngCliente) {
        var control = L.Routing.control({
            waypoints: [
                L.latLng(45.3949, -72.7297),
                L.latLng(latCliente, lngCliente)
            ],
            routeWhileDragging: true
        }).addTo(map);

        control.on('routesfound', function(e) {
            var routes = e.routes;
            var summary = routes[0].summary;
            alert("Distance : " + summary.totalDistance / 1000 + " km");
        });
    }

    document.getElementById('routeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var addressCliente = document.getElementById('addressCliente').value;
        geocodeAddress(addressCliente, function(coords) {
            calcularRuta(coords[0], coords[1]);
        });
    });


    // Charger les collections de montres desde JSON
    const productGrid = document.querySelector('.product-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (productGrid && filterButtons.length > 0) {
        fetch('data/collections.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error de red: ' + response.statusText);
                }
                return response.json();
            })
            .then(collections => {
                // Fonction pour afficher les montres
                const displayWatches = (watches) => {
                    productGrid.innerHTML = '';
                    watches.forEach(watch => {
                        const watchElement = document.createElement('div');
                        watchElement.className = 'watch-item';
                        watchElement.innerHTML = `
                            <img src="${watch.image}" alt="${watch.name}">
                            <h3>${watch.name}</h3>
                            <p>${watch.description}</p>
                            <span class="price">${watch.price}</span>
                        `;
                        productGrid.appendChild(watchElement);
                    });
                };

                // Afficher toutes les montres au chargement
                displayWatches(collections.flatMap(collection => collection.watches));

                // Ajouter les événements de filtrage
                filterButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const filter = button.getAttribute('data-filter');
                        filterButtons.forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');

                        if (filter === 'all') {
                            displayWatches(collections.flatMap(collection => collection.watches));
                        } else {
                            const filteredWatches = collections.find(collection => collection.name.toLowerCase() === filter).watches;
                            displayWatches(filteredWatches);
                        }
                    });
                });
            })
            .catch(error => console.error('Error al cargar las colecciones:', error));
    }

});
