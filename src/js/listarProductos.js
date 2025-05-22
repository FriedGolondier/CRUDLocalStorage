document.addEventListener('DOMContentLoaded', function () {
    const formAgregarProducto = document.getElementById('formAgregarProducto');
    const mensajeExito = crearMensajeExito();
    const listaProductos = document.getElementById('tbodyProductos');
    const divListaProductos = document.getElementById('divListaProductos');
    const rangoCantidad = document.getElementById('rngCantidad');
    const outputCantidad = rangoCantidad.nextElementSibling;
    const btnBuscar = document.getElementById('btnBuscar');
    const btnMostrarTodos = document.getElementById('btnMostrarTodos');
    const txtBuscar = document.getElementById('txtBuscar');
    let productos = cargarProductos();
    const busquedaCategoria = document.getElementById('busquedaCategoria');


    document.querySelectorAll('input[name="extraSwitch"]').forEach(switchInput => {
        switchInput.addEventListener('change', function () {
            if (this.checked) {
                document.querySelectorAll('input[name="extraSwitch"]').forEach(other => {
                    if (other !== this) other.checked = false;
                });
            }
        });
    });

    productos.forEach(producto => agregarProductoATabla(producto));
    actualizarVisibilidadTabla();

    outputCantidad.textContent = rangoCantidad.value;
    rangoCantidad.addEventListener('input', () => {
        outputCantidad.textContent = rangoCantidad.value;
    });

    formAgregarProducto.addEventListener('submit', function (e) {
        e.preventDefault();

        const idArticulo = document.getElementById('txtIDArticulo').value.trim();
        const nombre = document.getElementById('txtNombre').value.trim();
        const cantidad = document.getElementById('rngCantidad').value;
        const precio = document.getElementById('txtPrecio').value.trim();
        const descripcion = document.getElementById('txtDescripcion').value.trim();
        const categoria = document.getElementById('cboCategoria').value;
        const tipoVenta = document.querySelector('input[name="rdbTipoVenta"]:checked')?.value;
        const fechaEmision = document.getElementById('Emision').value;

        const extraSwitch = document.querySelector('input[name="extraSwitch"]:checked');
        const extra = extraSwitch ? extraSwitch.value : 'Ninguno';

        let errores = [];

        if (!idArticulo || !nombre || !cantidad || !precio || !descripcion || !categoria || !fechaEmision) {
            errores.push('Todos los campos son obligatorios.');
        }

        const idDuplicado = productos.some(p => p.id === idArticulo);
        if (idDuplicado) {
            errores.push('Ya tienes un producto registrado con ese ID.');
        }

        if (!/^\d{5}$/.test(idArticulo)) {
            errores.push('El ID debe contener exactamente 5 dígitos numéricos.');
        }

        if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/.test(nombre)) {
            errores.push('El nombre solo debe contener letras y espacios.');
        }

        if (parseFloat(precio) < 0) {
            errores.push('El precio no puede ser negativo.');
        }

        if (parseInt(cantidad) < 0) {
            errores.push('La cantidad no puede ser negativa.');
        }

        if (errores.length > 0) {
            mostrarErrores(errores);
            return;
        }

        const nuevoProducto = {
            id: idArticulo,
            nombre,
            cantidad,
            precio: parseFloat(precio).toFixed(2),
            descripcion,
            categoria,
            tipoVenta,
            fechaEmision,
            extra
        };

        productos.push(nuevoProducto);
        guardarProductos(productos);
        agregarProductoATabla(nuevoProducto);
        actualizarVisibilidadTabla();
        formAgregarProducto.reset();
        outputCantidad.textContent = "50";
        mostrarMensajeExito('Producto registrado correctamente.');
    });

    function agregarProductoATabla(producto) {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.cantidad}</td>
            <td>${producto.descripcion}</td>
            <td>$${producto.precio}</td>
            <td>${producto.categoria}</td>
            <td>${producto.tipoVenta}</td>
            <td>${producto.fechaEmision}</td>
            <td>${producto.extra}</td>
            <td>
                <button class="btn btn-primary btn-sm btn-editar">Editar</button>
                <button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>
            </td>
        `;

        tr.querySelector('.btn-editar').addEventListener('click', () => iniciarEdicion(tr, producto));
        tr.querySelector('.btn-eliminar').addEventListener('click', () => eliminarProducto(producto.id));

        listaProductos.appendChild(tr);
    }


    function iniciarEdicion(tr, productoOriginal) {
        const celdas = tr.querySelectorAll('td');
        const categoriasDisponibles = Array.from(document.getElementById('cboCategoria').options).map(opt => opt.value);

        celdas[1].innerHTML = `<input type="text" value="${productoOriginal.nombre}" class="form-control form-control-sm">`;
        celdas[2].innerHTML = `<input type="number" value="${productoOriginal.cantidad}" class="form-control form-control-sm">`;
        celdas[3].innerHTML = `<input type="text" value="${productoOriginal.descripcion}" class="form-control form-control-sm">`;
        celdas[4].innerHTML = `<input type="number" step="0.01" value="${productoOriginal.precio}" class="form-control form-control-sm">`;

        celdas[5].innerHTML = `
            <select class="form-control form-control-sm">
                ${categoriasDisponibles.map(cat => `
                    <option value="${cat}" ${cat === productoOriginal.categoria ? 'selected' : ''}>${cat}</option>
                `).join('')}
            </select>
        `;

        celdas[6].innerHTML = `
            <select class="form-control form-control-sm">
                <option value="menudeo" ${productoOriginal.tipoVenta === 'menudeo' ? 'selected' : ''}>menudeo</option>
                <option value="mayoreo" ${productoOriginal.tipoVenta === 'mayoreo' ? 'selected' : ''}>mayoreo</option>
            </select>
        `;

        celdas[7].innerHTML = `<input type="date" value="${productoOriginal.fechaEmision}" class="form-control form-control-sm">`;
        celdas[8].textContent = productoOriginal.extra;
        celdas[9].innerHTML = `
            <button class="btn btn-success btn-sm btn-guardar">Guardar</button>
            <button class="btn btn-secondary btn-sm btn-cancelar">Cancelar</button>
        `;

        celdas[9].querySelector('.btn-guardar').addEventListener('click', () => {
            const nombre = celdas[1].querySelector('input').value.trim();
            const cantidad = parseInt(celdas[2].querySelector('input').value);
            const descripcion = celdas[3].querySelector('input').value.trim();
            const precio = parseFloat(celdas[4].querySelector('input').value);
            const categoria = celdas[5].querySelector('select').value;
            const tipoVenta = celdas[6].querySelector('select').value;
            const fechaEmision = celdas[7].querySelector('input').value;
            const extra = productoOriginal.extra;

            let errores = [];

            if (!nombre || !descripcion || !categoria || !tipoVenta || !fechaEmision) {
                errores.push('Todos los campos deben estar completos.');
            }

            if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/.test(nombre)) {
                errores.push('El nombre solo debe contener letras y espacios.');
            }

            if (isNaN(cantidad) || cantidad < 0) {
                errores.push('La cantidad debe ser un número no negativo.');
            }

            if (isNaN(precio) || precio < 0) {
                errores.push('El precio debe ser un número no negativo.');
            }

            if (errores.length > 0) {
                mostrarErrores(errores);
                return;
            }

            productoOriginal.nombre = nombre;
            productoOriginal.cantidad = cantidad;
            productoOriginal.descripcion = descripcion;
            productoOriginal.precio = precio.toFixed(2);
            productoOriginal.categoria = categoria;
            productoOriginal.tipoVenta = tipoVenta;
            productoOriginal.fechaEmision = fechaEmision;
            productoOriginal.extra = extra;

            guardarProductos(productos);
            recargarTabla();
            mostrarNotificacion('Producto actualizado correctamente.');
        });

        celdas[9].querySelector('.btn-cancelar').addEventListener('click', () => recargarTabla());
    }


    function eliminarProducto(id) {
        const producto = productos.find(p => p.id === id);
        if (!producto) return;

        mostrarAdvertencia(`¿Estás seguro de que deseas eliminar el producto con ID: ${producto.id}?`, () => {
            productos = productos.filter(p => p.id !== id);
            guardarProductos(productos);
            recargarTabla();
            mostrarNotificacion(`Producto con ID ${id} eliminado correctamente.`);
        });
    }

    function mostrarAdvertencia(mensaje, callbackConfirmacion) {
        const confirmacion = document.createElement('div');
        confirmacion.className = 'alerta alerta-confirmacion bg-light text-dark border border-warning';
        confirmacion.innerHTML = `
            <p class="m-0 mb-2 fw-bold">${mensaje}</p>
            <div class="d-flex justify-content-end gap-2">
                ${callbackConfirmacion ? '<button class="btn btn-sm btn-danger">Eliminar</button>' : ''}
                <button class="btn btn-sm btn-secondary">${callbackConfirmacion ? 'Cancelar' : 'Aceptar'}</button>
            </div>
        `;

        document.body.appendChild(confirmacion);
        confirmacion.style.opacity = '1';

        const btnConfirmar = confirmacion.querySelector('.btn-danger');
        const btnCancelar = confirmacion.querySelector('.btn-secondary');

        if (btnConfirmar && callbackConfirmacion) {
            btnConfirmar.addEventListener('click', () => {
                callbackConfirmacion();
                confirmacion.remove();
            });
        }

        btnCancelar.addEventListener('click', () => {
            confirmacion.remove();
        });

        setTimeout(() => {
            if (document.body.contains(confirmacion)) confirmacion.remove();
        }, 10000);
    }

    function mostrarNotificacion(mensaje, tipo = 'success', duracion = 3000) {
        const notificacionDiv = document.createElement('div');
        notificacionDiv.classList.add('notificacion', tipo);
        notificacionDiv.textContent = mensaje;
        document.body.appendChild(notificacionDiv);

        setTimeout(() => {
            notificacionDiv.classList.add('show');
        }, 100);

        setTimeout(() => {
            notificacionDiv.classList.remove('show');
            setTimeout(() => {
                notificacionDiv.remove();
            }, 500);
        }, duracion);
    }


    function guardarProductos(productos) {
        localStorage.setItem('productos', JSON.stringify(productos));
    }


    function recargarTabla() {
        listaProductos.innerHTML = '';
        productos.forEach(p => agregarProductoATabla(p));
        actualizarVisibilidadTabla();
    }

    function actualizarVisibilidadTabla() {
        divListaProductos.style.display = productos.length > 0 ? 'block' : 'none';
    }

    function mostrarErrores(errores) {
        const mensajeError = errores.join('       ||       ');
        mostrarNotificacion(mensajeError, 'error', 5000);
    }

    function mostrarMensajeExito(msg) {
        mostrarNotificacion(msg);
    }

    function crearMensajeExito() {
        let contenedor = document.createElement('div');
        contenedor.id = 'mensajeExito';
        contenedor.className = 'mt-2 text-center';
        contenedor.style.display = 'none';
        formAgregarProducto.insertAdjacentElement('afterend', contenedor);
        return contenedor;
    }

    function cargarProductos() {
        return JSON.parse(localStorage.getItem('productos')) || [];
    }

    function guardarProductos(productos) {
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    // Evento cuando cambia la selección de categoría
    busquedaCategoria.addEventListener('change', function () {
        if (this.value !== "") {
            // Si se selecciona una categoría, bloquear el campo de texto
            txtBuscar.disabled = true;
            txtBuscar.value = ""; // Opcional: limpiar el campo de texto
        } else {
            // Si no hay categoría seleccionada, desbloquear el campo
            txtBuscar.disabled = false;
        }
    });

    // Modificar la función buscarProducto para mantener la lógica
    function buscarProducto() {
        const categoriaSeleccionada = busquedaCategoria.value;
        const terminoBusqueda = txtBuscar.value.trim().toLowerCase();
        listaProductos.innerHTML = '';
        let resultados = [];

        // Reactivar el campo de texto al hacer clic en Buscar
        txtBuscar.disabled = false;

        // Buscar por categoría si hay una seleccionada
        if (categoriaSeleccionada && categoriaSeleccionada !== "") {
            resultados = productos.filter(producto =>
                producto.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
            );

            if (resultados.length === 0) {
                mostrarNotificacion(`No hay productos en la categoría ${categoriaSeleccionada}.`, 'error');
            } else {
                mostrarNotificacion(`Mostrando productos de la categoría ${categoriaSeleccionada}.`);
                resultados.forEach(producto => agregarProductoATabla(producto));
            }
        }
        // Buscar por texto si no hay categoría seleccionada
        else {
            if (terminoBusqueda) {
                resultados = productos.filter(producto =>
                    producto.id.toLowerCase().includes(terminoBusqueda) ||
                    producto.nombre.toLowerCase().includes(terminoBusqueda)
                );

                if (resultados.length === 0) {
                    mostrarNotificacion(`No hay un producto con ese ID o nombre.`, 'error');
                } else {
                    mostrarNotificacion(`Producto encontrado con éxito.`);
                    resultados.forEach(producto => agregarProductoATabla(producto));
                }
            } else {
                mostrarTodosLosProductos();
            }
        }
        actualizarVisibilidadTabla();
    }

    // El resto del código permanece igual
    busquedaCategoria.addEventListener('change', function () {
        if (this.value !== "") {
            txtBuscar.disabled = true;
            txtBuscar.value = "";
        } else {
            txtBuscar.disabled = false;
        }
    });

    // Modificar mostrarTodosLosProductos para resetear ambos filtros
    function mostrarTodosLosProductos() {
        listaProductos.innerHTML = '';
        productos.forEach(producto => agregarProductoATabla(producto));
        actualizarVisibilidadTabla();
        busquedaCategoria.value = "";
        txtBuscar.disabled = false;
        txtBuscar.value = "";
        mostrarNotificacion('Todos los productos se muestran a continuación');
    }

    // Eventos para los botones
    btnBuscar.addEventListener('click', buscarProducto);
    btnMostrarTodos.addEventListener('click', mostrarTodosLosProductos);

    // Evento para tecla Enter en el campo de búsqueda
    txtBuscar.addEventListener('keypress', function (event) {
        if (event.key === 'Enter' && !txtBuscar.disabled) {
            buscarProducto();
        }
    });

    btnBuscar.addEventListener('click', buscarProducto);
    btnMostrarTodos.addEventListener('click', mostrarTodosLosProductos);

    txtBuscar.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            buscarProducto();
        }
    });

    document.getElementById('btnEliminarBD').addEventListener('click', () => {
        if (productos.length === 0) {
            mostrarNotificacion('No tienes productos en la base de datos.', 'error');
            return;
        }
        mostrarAdvertencia("¿Estás seguro de que deseas eliminar toda la base de datos?", () => {
            productos = [];
            localStorage.removeItem('productos');
            recargarTabla();
            mostrarNotificacion('Base de datos eliminada correctamente.');
        });
    });
});