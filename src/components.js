const estructura = {
    titulo: "",
    descripcion: "",
    administrador: "",
    valor: 0,
    avance: 0,

    objetivos: [
        {
            titulo: "",
            avance: "",
            actividades: [
                {
                    nombre: "",
                    avance: "",
                    evidencias: [
                        {
                            descripcion: "",
                            indicador: "",
                            meta: "",

                            avance: "",
                            meses: [
                                {
                                    nombre: "ENERO",
                                    mes: 1,
                                    semana: 1,

                                    meta: 0,
                                    avance: 0,
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
}

class Proyecto {
    constructor(titulo, descripcion, administrador, valor) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.administrador = administrador;
        this.valor = valor;

        this.cumplido = 0;
        this.objetivos = [];
        this.id = null;
    }

    updateAvance() {
        const avance = this.calcularAvance()
        //this.tagAvance.textContent = `${parseFloat(avance.toFixed(2))}%`;
    }

    calcularAvance() {
        let ponderado = 0;
        let pesos = 0;

        this.objetivos.forEach(objetivo => {
            ponderado += objetivo.calcularAvance() * parseInt(objetivo.porcentaje);
            pesos += parseInt(objetivo.porcentaje);
        });

        return pesos === 0 ? 0 : ponderado / pesos;
    }

    enumerarObjetivos() {
        this.objetivos.forEach((objetivo, i) => {
            const indexObjetivo = i + 1;
            objetivo.enumerador = `O.${indexObjetivo}`;

            objetivo.actividades.forEach((actividad, j) => {
                const indexActividad = j + 1;
                actividad.enumerador = `A.${indexObjetivo}.${indexActividad}`;

                actividad.evidencias.forEach((evidencia, k) => {
                    const indexEvidencia = k + 1;
                    evidencia.enumerador = `E.${indexObjetivo}.${indexActividad}.${indexEvidencia}`;
                });
            });
        });
    }

    verificarPorcentajes() {
        let porcentaje = 0;

        this.objetivos.forEach(objetivo => {
            porcentaje += objetivo.porcentaje;
        });

        return porcentaje == 100;
    }

    /* Funciones CRUD para los objetivos */
    addObjetivo(objetivo) {
        this.objetivos.push(objetivo);
    }

    deleteObjetivo(id) {
        this.objetivos.splice(id, 1);
    }

    saveInDB() {
        const id = GLOBAL.firestore.addProyecto(
            JSON.parse(this.convertToJSON())
        );
        this.id = id;
    }

    deleteInDB() {
        GLOBAL.firestore.borrarProyecto(this.id);
    }

    updateInDB() {
        GLOBAL.firestore.updateProyecto(
            JSON.parse(this.convertToJSON())
        );
    }

    convertToJSON() {
        const cache = [];
        return JSON.stringify(this, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.includes(value)) return;
                cache.push(value);
            }
            return value;
        });
    }

    cancel() {
        this.component.remove();
        GLOBAL.state.proyecto = null;
    }

    initComponent() {
        //Inicio un contenedor DIV con sus estilos
        const component = document.createElement('div');
        component.className = "bg-body-tertiary bg-opacity-100 p-2";
        component.classList.add("container-fluid");

        //Etiqueta y control de entrada para el nombre del proyecto
        const labelTitulo = document.createElement('label');
        labelTitulo.className = "text-secondary"
        labelTitulo.textContent = 'Nombre del proyecto';

        const titulo = document.createElement('input');
        titulo.className = "form-control fs-5";
        titulo.type = 'text';
        titulo.placeholder = 'Nombre proyecto / componente';
        titulo.addEventListener('input', () => this.titulo = titulo.value);
        titulo.value = this.titulo;

        //Etiqueta y control de entrada para el nombre del Objetivo o descripción del proyecto
        const labelDescripcion = document.createElement('label');
        labelDescripcion.textContent = 'Descripción / Objetivo';
        labelDescripcion.className = "text-secondary mt-3";

        const descripcion = document.createElement('textarea');
        descripcion.className = "form-control fs-5";
        descripcion.placeholder = 'Descripción';
        descripcion.addEventListener('input', () => this.descripcion = descripcion.value);
        descripcion.value = this.descripcion;

        //Etiqueta y control de entrada para el administrador del proyecto
        const labelAdministrador = document.createElement('label');
        labelAdministrador.textContent = 'Administrador ';
        labelAdministrador.className = "text-secondary mt-3";

        const administrador = document.createElement('input');
        administrador.className = "form-control";
        administrador.type = 'text';
        administrador.placeholder = 'Administrador';
        administrador.addEventListener('input', () => this.administrador = administrador.value);
        administrador.value = this.administrador;

        /*
        const labelValor = document.createElement('label');
        labelValor.textContent = 'Valor';
        labelValor.className = "mt-3 mb-2";

        const valor = document.createElement('input');
        valor.className = "form-control";
        valor.type = 'number';
        valor.placeholder = 'Valor';
        valor.addEventListener('input', () => this.valor = valor.value);
        valor.value = this.valor;*/


        //Un control contenedor tipo acordeon para gardar los objetivos
        const contenedorObjetivos = document.createElement('div');
        contenedorObjetivos.className = "mt-4 accordion";
        contenedorObjetivos.id = "contenedorObjetivos";

        //Un control contenedor tipo div para gardar colocar boton y título...
        const contenedorHeaderObjetivos = document.createElement('div');
        contenedorHeaderObjetivos.className = "d-flex justify-content-between align-items-center rounded p-2";
        contenedorHeaderObjetivos.style.background = "#424949"

        const headerObjetivos = document.createElement('h4');
        headerObjetivos.className = "text-white";
        headerObjetivos.textContent = 'Objetivos';

        const btnObjetivo = document.createElement('button');
        btnObjetivo.className = "btn btn-secondary";
        btnObjetivo.textContent = 'Agregar Objetivo';
        btnObjetivo.addEventListener('click', () => {
            const objetivo = new Objetivo('', 0, this);
            this.addObjetivo(objetivo);
            GLOBAL.state.proyecto.enumerarObjetivos();

            objetivo.initComponent();
            contenedorObjetivos.appendChild(objetivo.component);
        });

        contenedorHeaderObjetivos.appendChild(headerObjetivos);
        contenedorHeaderObjetivos.appendChild(btnObjetivo);

        this.objetivos.forEach(objetivo => {
            objetivo.initComponent();
            contenedorObjetivos.appendChild(objetivo.component);
        });

        const hr = document.createElement('hr');
        hr.className = "hr-blue my-4";

        const hr2 = document.createElement('hr');
        hr2.className = "hr-blue my-4";

        const buttonGuardar = document.createElement('button');
        buttonGuardar.className = "btn btn-secondary w-100 py-2";
        buttonGuardar.textContent = 'Guardar en la nube';

        buttonGuardar.addEventListener('click', () => {
            this.enumerarObjetivos();

            const buttonConfirmar = document.getElementById('btn-modal-confirmar');
            document.getElementById('modal-confirmar-body').textContent = this.id ? 'Desea guardar los cambios realizados?' : 'Desea guardar el proyecto en la base de datos?';

            buttonConfirmar.onclick = () => {
                this.id ? this.updateInDB() : this.saveInDB();
                modal.hide();
            }

            const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
            modal.show();
        });

        const buttonCancelar = document.createElement('button');
        buttonCancelar.className = "btn btn-secondary";
        buttonCancelar.textContent = 'Cerrar';
        buttonCancelar.addEventListener('click', () => {
            this.cancel();
        });

        const buttonEliminar = document.createElement('button');
        buttonEliminar.className = "btn btn-secondary";
        buttonEliminar.textContent = 'Eliminar';
        buttonEliminar.addEventListener('click', () => {
            const buttonConfirmar = document.getElementById('btn-modal-confirmar');
            document.getElementById('modal-confirmar-body').textContent = "Desea eliminar el proyecto? esta accion no se puede deshacer";

            buttonConfirmar.onclick = () => {
                this.deleteInDB();
                modal.hide();
                this.cancel();
            }

            const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
            modal.show();
        });

        const rowTitulo = document.createElement('div');
        rowTitulo.className = "d-flex justify-content-between align-items-center mb-3";
        rowTitulo.appendChild(labelTitulo);
        if (this.id) rowTitulo.appendChild(buttonEliminar);
        rowTitulo.appendChild(buttonCancelar);

        component.appendChild(rowTitulo);
        component.appendChild(titulo);
        component.appendChild(labelDescripcion);
        component.appendChild(descripcion);
        component.appendChild(labelAdministrador);
        component.appendChild(administrador);
        //component.appendChild(labelValor);
        //component.appendChild(valor);

        component.appendChild(hr);

        component.appendChild(contenedorHeaderObjetivos);
        component.appendChild(contenedorObjetivos);

        component.appendChild(hr2);

        component.appendChild(buttonGuardar);

        this.component = component;
    }

    static getPreviewComponent(objProyecto) {

        const proyecto = Proyecto.loadAsInstance(objProyecto);

        const component = document.createElement('div');
        component.className = "proyecto-preview p-3 mb-3 border rounded";

        const labelTitulo = document.createElement('label');
        labelTitulo.textContent = 'Título del proyecto';
        labelTitulo.className = "mb-2 fs-6 fw-light";

        const titulo = document.createElement('h3');
        titulo.className = "mb-3";
        titulo.textContent = objProyecto.titulo;

        const divProgress = document.createElement('div');
        divProgress.className = 'progress';
        divProgress.setAttribute('role', 'progressbar');
        divProgress.setAttribute('aria-valuenow', '25');
        divProgress.setAttribute('aria-valuemin', '0');
        divProgress.setAttribute('aria-valuemax', '100');

        const avance = proyecto.calcularAvance();
        const valueAvance = avance ? parseFloat(avance.toFixed(2)) : 0;

        const divProgressBar = document.createElement('div');
        divProgressBar.className = 'progress-bar bg-success';

        divProgressBar.style.width = `${valueAvance}%`;
        divProgressBar.textContent = `${valueAvance}%`;

        // Agregar el div secundario al div principal
        divProgress.appendChild(divProgressBar);

        component.appendChild(labelTitulo);
        component.appendChild(titulo);
        component.appendChild(divProgress);

        component.addEventListener('click', () => {
            handlerCargarProyecto(objProyecto);
        });

        return component;
    }

    static loadAsInstance(objProyecto) {
        const loadObjetivos = (objetivos, parent) => {
            return objetivos.map(objetivo => {
                const objetivoObj = new Objetivo(objetivo.titulo, objetivo.porcentaje, parent);
                objetivoObj.cumplido = objetivo.cumplido;
                objetivoObj.actividades = loadActividades(objetivo.actividades, objetivoObj);
                return objetivoObj;
            });
        }

        const loadActividades = (actividades, parent) => {
            return actividades.map(actividad => {
                const actividadObj = new Actividad(actividad.nombre, parent);
                actividadObj.cumplido = actividad.cumplido;
                actividadObj.evidencias = loadEvidencias(actividad.evidencias, actividadObj);
                return actividadObj;
            });
        }

        const loadEvidencias = (evidencias, parent) => {
            return evidencias.map(evidencia => {
                const evidenciaObj = new Evidencia(
                    evidencia.descripcion, evidencia.indicador, evidencia.meta, evidencia.porcentaje, parent
                );
                evidenciaObj.cumplido = evidencia.cumplido;
                evidenciaObj.meses = loadMeses(evidencia.meses, evidenciaObj);
                evidenciaObj.porcentaje = evidencia.porcentaje;
                return evidenciaObj;
            });
        }

        const loadMeses = (meses, parent) => {
            return meses.map(mes => {
                const mesObj = new Mes(mes.fecha, mes.meta, parent);
                mesObj.cumplido = mes.cumplido;
                return mesObj;
            });
        }

        const proyecto = new Proyecto(objProyecto.titulo, objProyecto.descripcion, objProyecto.administrador, objProyecto.valor);
        GLOBAL.state.proyecto = proyecto;
        proyecto.cumplido = objProyecto.cumplido;
        proyecto.objetivos = loadObjetivos(objProyecto.objetivos, proyecto);
        proyecto.id = objProyecto.id;
        proyecto.enumerarObjetivos();

        return proyecto;
    }
}

class Objetivo {
    constructor(titulo, porcentaje, parent) {
        this.titulo = titulo;
        this.cumplido = 0;
        this.actividades = [];
        this.porcentaje = porcentaje;

        this.enumerador = null;
        this.tagAvance = null;
        this.parent = parent; // Referencia al elemento padre
    }

    updateAvance() {
        this.parent.updateAvance();
        const avance = this.calcularAvance()
        this.tagAvance.textContent = `${parseFloat(avance.toFixed(2))}%`;
    }

    calcularAvance() {
        let ponderado = 0;
        let pesos = 0;

        this.actividades.forEach(actividad => {
            actividad.evidencias.forEach(evidencia => {
                const porcentaje = parseInt(evidencia.porcentaje ?? 0);
                ponderado += evidencia.calcularAvance() * porcentaje;
                pesos += porcentaje;
            });
        });

        return pesos === 0 ? 0 : ponderado / pesos;
    }

    verificarPorcentajes() {
        let porcentaje = 0;

        this.actividades.forEach(actividad => {
            actividad.evidencias.forEach(evidencia => {
                porcentaje += evidencia.porcentaje;
            });
        });

        return porcentaje == 100;
    }

    /* Funciones CRUD para las actividades */
    addActividad(actividad) {
        this.actividades.push(actividad);
    }

    deleteActividad(id) {
        this.actividades.splice(id, 1);
    }

    initComponent() {

        const component = document.createElement('details');
        component.className = "objetivo border rounded ms-3 mb-3";

        const contenedorObjetivo = document.createElement('div');
        contenedorObjetivo.className = "mt-3 px-3";

        //Titulo del control de objetivo, collapse
        const summary = document.createElement('summary');
        summary.className = "text-uppercase text-white border rounded p-3";
        summary.style.background = "#707B7C"

        GLOBAL.state.proyecto.enumerarObjetivos();

        const summaryHead = document.createElement('div');
        summaryHead.className = "d-flex justify-content-between align-items-center";

        const h3 = document.createElement('h5');
        h3.textContent = `${this.enumerador} - ${this.titulo ? this.titulo : 'Titulo proyecto'}`;

        const totalAvance = document.createElement('h5');
        totalAvance.textContent = `${this.calcularAvance()}%`;
        this.tagAvance = totalAvance;

        summaryHead.appendChild(h3);
        summaryHead.appendChild(totalAvance);

        summary.appendChild(summaryHead);

        const headObjetivo = document.createElement('div');
        headObjetivo.className = "row align-items-end";

        const labelTitulo = document.createElement('label');
        labelTitulo.textContent = 'Objetivo';
        labelTitulo.className = "mb-2 text-secondary";


        const titulo = document.createElement('input');
        titulo.className = "form-control";
        titulo.type = 'text';
        titulo.placeholder = 'Título';
        titulo.addEventListener('input', () => {
            this.titulo = titulo.value;
            h3.textContent = `${this.enumerador} - ${this.titulo}`;
        });
        titulo.value = this.titulo;

        const labelPorcentaje = document.createElement('label');
        labelPorcentaje.textContent = 'Porcentaje';
        labelPorcentaje.className = "mb-2 text-secondary";
        const porcentaje = document.createElement('input');
        porcentaje.className = "form-control";
        porcentaje.type = 'number';
        porcentaje.placeholder = 'Porcentaje';
        porcentaje.addEventListener('input', () => this.porcentaje = porcentaje.value);
        porcentaje.value = this.porcentaje;

        const contenedorActividades = document.createElement('div');

        const btnActividad = document.createElement('button');
        btnActividad.className = "btn btn-secondary";
        btnActividad.textContent = '+ Actividad';
        btnActividad.addEventListener('click', () => {
            const actividad = new Actividad('', this);
            this.addActividad(actividad);
            GLOBAL.state.proyecto.enumerarObjetivos();

            actividad.initComponent();
            contenedorActividades.appendChild(actividad.component);
        });

        this.actividades.forEach(actividad => {
            actividad.initComponent();
            contenedorActividades.appendChild(actividad.component);
        });

        const colTitulo = document.createElement('div');
        colTitulo.className = "col-5";
        colTitulo.appendChild(labelTitulo);
        colTitulo.appendChild(titulo);

        const colPorcentaje = document.createElement('div');
        colPorcentaje.className = "col-5";
        colPorcentaje.appendChild(labelPorcentaje);
        colPorcentaje.appendChild(porcentaje);

        const colBtn = document.createElement('div');
        colBtn.className = "col-2";
        colBtn.appendChild(btnActividad);

        headObjetivo.appendChild(colTitulo);
        headObjetivo.appendChild(colPorcentaje);
        headObjetivo.appendChild(colBtn);

        contenedorObjetivo.appendChild(headObjetivo);

        const hr = document.createElement('hr');
        hr.className = "hr-blue my-3";

        contenedorObjetivo.appendChild(hr);
        contenedorObjetivo.appendChild(contenedorActividades);

        component.appendChild(summary);
        component.appendChild(contenedorObjetivo);

        this.component = component;
    }
}

class Actividad {
    constructor(nombre, parent) {
        this.nombre = nombre;
        this.cumplido = 0;
        this.evidencias = [];

        this.enumerador = null;
        this.tagAvance = null;
        this.parent = parent; // Referencia al elemento padre
    }

    updateAvance() {
        this.parent.updateAvance();
        const avance = this.calcularAvance()
        this.tagAvance.textContent = `${parseFloat(avance.toFixed(2))}%`;
    }

    calcularAvance() {

        let ponderado = 0;
        let pesos = 0;

        this.evidencias.forEach(evidencia => {
            const porcentaje = parseInt(evidencia.porcentaje ?? 0);
            ponderado += evidencia.calcularAvance() * porcentaje;
            pesos += porcentaje;
        });

        return pesos === 0 ? 0 : ponderado / pesos;
    }

    /* Funciones CRUD para las evidencias */
    addEvidencia(evidencia) {
        this.evidencias.push(evidencia);
    }

    deleteEvidencia(id) {
        this.evidencias.splice(id, 1);
    }

    initComponent() {
        const component = document.createElement('details');
        component.className = "actividad rounded border mb-3";

        //Control encabezado arcordeon de actividades 
        const summary = document.createElement('summary');
        GLOBAL.state.proyecto.enumerarObjetivos();
        summary.style.background = "#B2BABB"
        summary.className = "text-uppercase border rounded p-2"

        const summaryHead = document.createElement('div');
        summaryHead.className = "d-flex justify-content-between";

        const summaryTitle = document.createElement('h5');
        summaryTitle.textContent = `${this.enumerador}`;

        const totalAvance = document.createElement('h5');
        totalAvance.textContent = `${this.calcularAvance()}%`;
        this.tagAvance = totalAvance;

        summaryHead.appendChild(summaryTitle);
        summaryHead.appendChild(totalAvance);
        summary.appendChild(summaryHead);

        const contenedorActividad = document.createElement('div');
        contenedorActividad.className = "mt-3 px-3";

        const contenedorEvidencias = document.createElement('div');

        const labelNombre = document.createElement('label');
        labelNombre.textContent = 'Nombre actividad';
        labelNombre.className = "mb-2";
        const nombre = document.createElement('input');
        nombre.className = "form-control";
        nombre.type = 'text';
        nombre.placeholder = 'Nombre';
        nombre.addEventListener('input', () => this.nombre = nombre.value);
        nombre.value = this.nombre;

        const btnEvidencia = document.createElement('button');
        btnEvidencia.className = "btn btn-secondary";
        btnEvidencia.textContent = '+ Evidencia';
        btnEvidencia.addEventListener('click', () => {
            const evidencia = new Evidencia('', '', 0, 0, this);
            this.addEvidencia(evidencia);
            GLOBAL.state.proyecto.enumerarObjetivos();

            evidencia.initComponent();
            contenedorEvidencias.appendChild(evidencia.component);
        });

        this.evidencias.forEach(evidencia => {
            evidencia.initComponent();
            contenedorEvidencias.appendChild(evidencia.component);
        });

        const row = document.createElement('div');
        row.className = "row align-items-end";

        const colNombre = document.createElement('div');
        colNombre.className = "col-10";
        colNombre.appendChild(labelNombre);
        colNombre.appendChild(nombre);

        const colBtn = document.createElement('div');
        colBtn.className = "col-2";
        colBtn.appendChild(btnEvidencia);

        row.appendChild(colNombre);
        row.appendChild(colBtn);

        const hr = document.createElement('hr');
        hr.className = "my-3";

        contenedorActividad.appendChild(row);
        contenedorActividad.appendChild(hr);
        contenedorActividad.appendChild(contenedorEvidencias);

        component.appendChild(summary);
        component.appendChild(contenedorActividad);

        this.component = component;
    }
}

class Evidencia {
    constructor(descripcion, indicador, meta, porcentaje, parent) {
        this.descripcion = descripcion;
        this.indicador = indicador;
        this.meta = meta;
        this.porcentaje = porcentaje ?? 0;

        this.cumplido = 0;
        this.meses = [];
        this.enumerador = null;
        this.tagAvance = null;
        GLOBAL.state.proyecto.enumerarObjetivos();
        this.parent = parent; // Referencia al elemento padre
    }

    updateAvance() {
        this.parent.updateAvance();

        const avance = this.calcularAvance()
        this.tagAvance.textContent = `${parseFloat(avance.toFixed(2))}%`;
    }

    calcularAvance() {

        const sumCumplido = this.meses.reduce((acc, mes) => acc + parseInt(mes.cumplido), 0);
        return calcPorcenaje(sumCumplido, this.meta);
    }

    /* Funciones CRUD para los meses */
    addMes(mes) {
        this.meses.push(mes);
    }

    deleteMes(id) {
        this.meses.splice(id, 1);
    }

    initComponent() {

        const component = document.createElement('details');
        component.className = "actividad rounded border mb-3";

        const summary = document.createElement('summary');
        summary.className = "p-2 border rounded text-uppercase fs-6";
        summary.style.background = "#F2F4F4 "

        GLOBAL.state.proyecto.enumerarObjetivos();

        const summaryHead = document.createElement('div');
        summaryHead.className = "d-flex justify-content-between align-items-center";

        const summaryTitle = document.createElement('h6');
        summaryTitle.textContent = `Evidencia / Estrategia ${this.enumerador}`;

        const totalAvance = document.createElement('h6');
        totalAvance.textContent = `${this.calcularAvance()}%`;
        this.tagAvance = totalAvance;

        summaryHead.appendChild(summaryTitle);
        summaryHead.appendChild(totalAvance);
        summary.appendChild(summaryHead);

        const contenedorEvidencia = document.createElement('div');
        contenedorEvidencia.className = "mt-3 px-3";

        const labelDescripcion = document.createElement('label');
        labelDescripcion.textContent = 'Descripcion Evidencia / Estrategia';
        labelDescripcion.className = "mb-2 text-secondary";

        const descripcion = document.createElement('textarea');
        descripcion.className = "form-control mb-3 ";
        descripcion.placeholder = 'Descripción';
        descripcion.value = this.descripcion;
        descripcion.addEventListener('input', () => this.descripcion = descripcion.value);

        const labelMeta = document.createElement('label');
        labelMeta.textContent = 'Meta';
        labelMeta.className = "mb-2 text-secondary";
        const meta = document.createElement('input');
        meta.className = "form-control";
        meta.type = 'number';
        meta.placeholder = 'Meta';
        meta.value = this.meta;
        meta.addEventListener('input', () => {
            this.meta = meta.value
            this.updateAvance();
        });

        const labelIndicador = document.createElement('label');
        labelIndicador.textContent = 'Indicador';
        labelIndicador.className = "mb-2 text-secondary";
        const indicador = document.createElement('select');
        indicador.className = "form-control";
        addOptions(indicador, CONSTANTS.indicadores);
        indicador.addEventListener('change', () => this.indicador = indicador.value);

        const labelPorcentaje = document.createElement('label');
        labelPorcentaje.textContent = 'Porcentaje';
        labelPorcentaje.className = "mb-2";
        const porcentaje = document.createElement('input');
        porcentaje.className = "form-control";
        porcentaje.type = 'number';
        porcentaje.placeholder = 'Porcentaje';
        porcentaje.value = this.porcentaje ? this.porcentaje : 0;
        porcentaje.addEventListener('input', () => {
            this.porcentaje = porcentaje.value ? porcentaje.value : 0;
            this.updateAvance();
        });

        if (this.indicador) {
            indicador.value = this.indicador;
        }

        const row = document.createElement('div');
        row.className = "row align-items-end";

        const colMeta = document.createElement('div');
        colMeta.className = "col";
        colMeta.appendChild(labelMeta);
        colMeta.appendChild(meta);

        const colIndicador = document.createElement('div');
        colIndicador.className = "col";
        colIndicador.appendChild(labelIndicador);
        colIndicador.appendChild(indicador);

        const colPorcentaje = document.createElement('div');
        colPorcentaje.className = "col";
        colPorcentaje.appendChild(labelPorcentaje);
        colPorcentaje.appendChild(porcentaje);

        const contenedorMeses = document.createElement('div');
        contenedorMeses.className = "mt-3";

        const colProgramar = document.createElement('div');
        colProgramar.className = "col";

        const btnMes = document.createElement('button');
        btnMes.className = "col btn btn-secondary";
        btnMes.textContent = '+ Programar';
        btnMes.addEventListener('click', () => {
            const mes = new Mes('', 0, this);
            mes.initComponent();

            this.addMes(mes);
            contenedorMeses.appendChild(mes.component);
        });

        this.meses.forEach(mes => {
            mes.initComponent();
            contenedorMeses.appendChild(mes.component);
        });

        colProgramar.appendChild(btnMes);

        row.appendChild(colMeta);
        row.appendChild(colIndicador);
        row.appendChild(colPorcentaje);
        row.appendChild(colProgramar);

        contenedorEvidencia.appendChild(labelDescripcion);
        contenedorEvidencia.appendChild(descripcion);
        contenedorEvidencia.appendChild(row);
        contenedorEvidencia.appendChild(contenedorMeses);

        component.appendChild(summary);
        component.appendChild(contenedorEvidencia);

        this.component = component;
    }
}

class Mes {
    constructor(fecha, meta, parent) {
        this.fecha = fecha; // Fecha del mes
        this.meta = meta; // Meta del mes

        this.cumplido = 0; // Cumplido
        this.tagAvance = null; // Porcentaje de avance

        this.parent = parent; // Referencia al elemento padre
    }

    updateAvance() {
        this.parent.updateAvance();
        const avance = this.calcularAvance();
        this.tagAvance.textContent = `${avance}%`;
        avance == 100 ? this.tagAvance.classList.add('text-success') : this.tagAvance.classList.remove('text-success');
        avance >= 50 && avance < 100 ? this.tagAvance.classList.add('text-warning') : this.tagAvance.classList.remove('text-warning');
    }

    calcularAvance() {
        const avance = calcPorcenaje(this.cumplido, this.meta)
        return parseFloat(
            avance.toFixed(2)
        );
    }

    initComponent() {
        const component = document.createElement('div');
        component.className = "mes mb-3 p-3";

        const row = document.createElement('div');
        row.className = "row";

        const colFecha = document.createElement('div');
        colFecha.className = "col";

        const labelFecha = document.createElement('label');
        labelFecha.textContent = 'Fecha';
        labelFecha.className = "mb-2";

        const fecha = document.createElement('input');
        fecha.className = "form-control";
        fecha.type = 'date';
        fecha.placeholder = 'Fecha';
        fecha.addEventListener('input', () => this.fecha = fecha.value);
        fecha.value = this.fecha;

        colFecha.appendChild(labelFecha);
        colFecha.appendChild(fecha);

        const colMeta = document.createElement('div');
        colMeta.className = "col";

        const labelMeta = document.createElement('label');
        labelMeta.textContent = 'Meta';
        labelMeta.className = "mb-2";
        const meta = document.createElement('input');
        meta.className = "form-control";
        meta.type = 'number';
        meta.placeholder = 'Meta';
        meta.addEventListener('input', () => {
            this.meta = meta.value;
            this.updateAvance();
        });
        meta.value = this.meta;

        colMeta.appendChild(labelMeta);
        colMeta.appendChild(meta);

        const colCumplido = document.createElement('div');
        colCumplido.className = "col";

        const labelCumplido = document.createElement('label');
        labelCumplido.className = "mb-2";
        labelCumplido.textContent = 'Cumplido';

        const cumplido = document.createElement('input');
        cumplido.className = "form-control";
        cumplido.type = 'number';
        cumplido.placeholder = 'Cumplido';
        cumplido.addEventListener('input', () => {
            this.cumplido = cumplido.value;
            this.updateAvance();
        });
        cumplido.value = this.cumplido;

        colCumplido.appendChild(labelCumplido);
        colCumplido.appendChild(cumplido);

        const colAvance = document.createElement('div');
        colAvance.className = "col";

        const labelAvance = document.createElement('label');
        labelAvance.className = "mb-2 text-center mx-auto";
        labelAvance.textContent = 'Avance';

        const avance = document.createElement('h4');
        avance.className = "fw-bold text-center";
        avance.textContent = '0%';
        this.tagAvance = avance;
        this.updateAvance();

        colAvance.appendChild(labelAvance);
        colAvance.appendChild(avance);

        row.appendChild(colFecha);
        row.appendChild(colMeta);
        row.appendChild(colCumplido);
        row.appendChild(colAvance);

        component.appendChild(row);

        this.component = component;
    }
}

function limpiarContenedor() {
    document.getElementById('contenedor-proyecto').innerHTML = '';
}

function handlerCrearProyecto() {
    limpiarContenedor();
    const proyecto = new Proyecto('', '', '', 0);
    proyecto.initComponent();
    GLOBAL.state.proyecto = proyecto;

    document.getElementById('contenedor-proyecto').appendChild(proyecto.component);
}

function handlerCargarProyecto(proyectoObj) {
    limpiarContenedor();
    const proyecto = Proyecto.loadAsInstance(proyectoObj);
    proyecto.initComponent();
    GLOBAL.state.proyecto = proyecto;
    document.getElementById('contenedor-proyecto').appendChild(proyecto.component);
}

function handlerCargarTodo() {
    limpiarContenedor();
    document.getElementById("docPlain").hidden = true
    document.getElementById("contenedor-proyecto").hidden=false
    const proyectos = GLOBAL.state.proyectos;
    const contenedor = document.getElementById('contenedor-proyecto');
    if (proyectos.length === 0) {
        alert('No hay proyectos en la base de datos');
    } else {
        proyectos.forEach(proyecto => {
            const component = Proyecto.getPreviewComponent(proyecto);
            contenedor.appendChild(component);
        });
    }
}

document.getElementById('btn-header-crear').addEventListener('click', handlerCrearProyecto);
document.getElementById('btn-header-cargar').addEventListener('click', handlerCargarTodo);