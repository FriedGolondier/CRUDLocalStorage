document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const cantidad = document.getElementById('cantidad').value;
        const precio = document.getElementById('precio').value;
        const imagenInput = document.getElementById('imagen');

        const reader = new FileReader();

        reader.onload = function (event) {
            const imagenBase64 = event.target.result;

            let productos = JSON.parse(localStorage.getItem('productos')) || [];

            productos.push({
                nombre: nombre,
                cantidad: cantidad,
                precio: precio,
                imagen: imagenBase64
            });

            localStorage.setItem('productos', JSON.stringify(productos));
            mostrarAlerta('Producto añadido exitosamente!', 'text-success');
            window.location.href = '/index.html';
        };

        if (imagenInput.files.length > 0) {
            reader.readAsDataURL(imagenInput.files[0]);
        } else {
            mostrarAlerta('Por favor selecciona una imagen', 'text-danger');
        }
    });

    function mostrarAlerta(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.classList.add('mensaje', tipo);
        alerta.id = 'mensajeExito'; // o cualquier ID que elijas
        alerta.innerHTML = `
            <p>${mensaje}</p>
            <button onclick="cerrarAlerta()">X</button>
        `;
        document.body.appendChild(alerta);

        setTimeout(function() {
            alerta.style.opacity = 1;
        }, 100);

        setTimeout(function() {
            alerta.style.opacity = 0;
            setTimeout(function() {
                alerta.remove();
            }, 500);
        }, 3000);
    }

    function cerrarAlerta() {
        const alerta = document.getElementById('mensajeExito');
        if (alerta) {
            alerta.style.opacity = 0;
            setTimeout(function() {
                alerta.remove();
            }, 500);
        }
    }
});