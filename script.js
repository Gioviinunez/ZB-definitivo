let currentProfessional = document.getElementById('professional').value;
let patients = JSON.parse(localStorage.getItem(currentProfessional)) || [];

// Obtener el valor de caja chica inicial
const cajaChica = parseFloat(document.getElementById('cajaChicaInicial').value) || 0;

// Inicializamos arrays vacíos para gastos y retiros
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let withdrawals = JSON.parse(localStorage.getItem('withdrawals')) || [];

document.getElementById('professional').addEventListener('change', function() {
    currentProfessional = this.value;
    patients = JSON.parse(localStorage.getItem(currentProfessional)) || [];
    renderPatients();
});

// Agregar Paciente
document.getElementById('addPatient').addEventListener('click', function() {
    const name = document.getElementById('patientName').value;
    const operation = document.getElementById('operationType').value;
    const value = document.getElementById('operationValue').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const commission = document.getElementById('commission').value;

    if (name && operation && value && paymentMethod && commission) {
        const patient = {
            name, operation, value: parseFloat(value), paymentMethod, commission: parseFloat(commission)
        };
        patients.push(patient);
        localStorage.setItem(currentProfessional, JSON.stringify(patients));
        renderPatients();
    } else {
        alert('Por favor complete todos los campos.');
    }
});

// Borrar Paciente
document.getElementById('deletePatient').addEventListener('click', function() {
    const patientName = prompt('Ingrese el nombre del paciente a borrar:');
    patients = patients.filter(patient => patient.name !== patientName);
    localStorage.setItem(currentProfessional, JSON.stringify(patients));
    renderPatients();
});

// Mostrar Pacientes en la Tabla
function renderPatients() {
    const tbody = document.getElementById('patientTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Limpiar tabla
    patients.forEach(patient => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = patient.name;
        row.insertCell(1).textContent = patient.operation;
        row.insertCell(2).textContent = patient.value;
        row.insertCell(3).textContent = patient.paymentMethod;
        row.insertCell(4).textContent = patient.commission;
    });
}

// Función para guardar gasto
document.getElementById('add-expense').addEventListener('click', function() {
    const expenseInput = document.getElementById('expense').value;
    if (expenseInput.includes(',')) {
        const [description, amount] = expenseInput.split(',').map(item => item.trim());
        if (description && !isNaN(amount)) {
            expenses.push({ description, amount: parseFloat(amount) });
            localStorage.setItem('expenses', JSON.stringify(expenses));
            alert('Gasto guardado correctamente.');
            document.getElementById('expense').value = ''; // Limpiar input
        } else {
            alert('Por favor, ingresa un gasto válido con formato "nombre, valor".');
        }
    } else {
        alert('Por favor, ingresa el gasto en formato "nombre, valor".');
    }
});

// Función para guardar retiro
document.getElementById('add-withdrawal').addEventListener('click', function() {
    const withdrawalInput = document.getElementById('withdrawal').value;
    if (!isNaN(withdrawalInput) && withdrawalInput !== '') {
        withdrawals.push(parseFloat(withdrawalInput));
        localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
        alert('Retiro guardado correctamente.');
        document.getElementById('withdrawal').value = ''; // Limpiar input
    } else {
        alert('Por favor, ingresa un valor numérico para el retiro.');
    }
});

// Función para ver los gastos y retiros
document.getElementById('view-expenses-withdrawals').addEventListener('click', function() {
    let totalWithdrawals = withdrawals.reduce((acc, withdrawal) => acc + withdrawal, 0);
    let expensesList = expenses.map(expense => `${expense.description}: $${expense.amount}`).join('\n');
    
    const expensesTotal = expenses.reduce((acc, expense) => acc + expense.amount, 0);

    if (expensesList === '') {
        expensesList = 'No hay gastos registrados.';
    }

    alert(
        `Gastos:\n${expensesList}\n\n` +
        `Total de Gastos: $${expensesTotal}\n` +
        `Total de retiros: $${totalWithdrawals}`
    );
});

// Sumar valores de pacientes
// Sumar valores de pacientes y honorarios por profesional
document.getElementById('sumValues').addEventListener('click', function() {
    const totals = { efectivo: 0, debito: 0, comisiones: {} };

    // Calcular efectivo, débito y comisiones del profesional actual
    patients.forEach(patient => {
        if (patient.paymentMethod === 'efectivo') {
            totals.efectivo += patient.value;
        } else if (patient.paymentMethod === 'debito') {
            totals.debito += patient.value;
        }

        if (!totals.comisiones[currentProfessional]) {
            totals.comisiones[currentProfessional] = 0;
        }
        totals.comisiones[currentProfessional] += patient.commission;
    });

    // Calcular efectivo, débito y comisiones de todos los profesionales
    const professionals = ['Dra. Rocio', 'Dra. Xiomara', 'Dra. Leila', 'Dra. Florencia', 'Dr. Marcelo', 'Dra. Yohary'];
    let totalEfectivoGlobal = 0;
    let totalDebitoGlobal = 0;

    

    professionals.forEach(professional => {
        const professionalPatients = JSON.parse(localStorage.getItem(professional)) || [];

        totalEfectivoGlobal += professionalPatients.reduce((acc, patient) =>
            patient.paymentMethod === 'efectivo' ? acc + patient.value : acc, 0);
        

        totalDebitoGlobal += professionalPatients.reduce((acc, patient) =>
            patient.paymentMethod === 'debito' ? acc + patient.value : acc, 0);
    });
    

    let comisionesPorProfesional = '';
    for (const profesional in totals.comisiones) {
        comisionesPorProfesional += `${profesional}: $${totals.comisiones[profesional]}\n`;
    }
    

    alert(
        `Efectivo Total de ${currentProfessional}: $${totals.efectivo}\n` +
        `Débito Total de ${currentProfessional}: $${totals.debito}\n\n` +
        `Comisiones por profesional:\n${comisionesPorProfesional}\n\n` +
        `Total Efectivo de todos los Profesionales: $${totalEfectivoGlobal}\n` +
        `Total Débito de todos los Profesionales: $${totalDebitoGlobal}`
    );
});

// Función para el Cierre de Caja
document.getElementById('cierreDeCaja').addEventListener('click', function() {
    const cierreFecha = document.getElementById('cierreFecha').value;
    const professionals = ['Dra. Rocio', 'Dra. Xiomara', 'Dra. Leila', 'Dra. Florencia', 'Dr. Marcelo', 'Dra. Yohary'];

    // Obtener pacientes de la Dra. seleccionada
    const professionalPatients = JSON.parse(localStorage.getItem(currentProfessional)) || [];

    // Calcular totales de la Dra. seleccionada
    const totalEfectivo = professionalPatients.reduce((acc, patient) => 
        patient.paymentMethod === 'Efectivo' ? acc + patient.value : acc, 0) + cajaChica;
    const totalDebito = professionalPatients.reduce((acc, patient) => patient.paymentMethod === 'Débito' ? acc + patient.value : acc, 0);
    const totalComisiones = professionalPatients.reduce((acc, patient) => acc + patient.commission, 0);

    // Calcular totales globales
    let totalEfectivoGlobal = 0;
    let totalDebitoGlobal = 0;
    let totalComisionesGlobales = 0;

    professionals.forEach(professional => {
        const professionalPatients = JSON.parse(localStorage.getItem(professional)) || [];
        
        const totalEfectivo = professionalPatients.reduce((acc, patient) => 
            patient.paymentMethod === 'Efectivo' ? acc + patient.value : acc, 0) + cajaChica;
        const totalDebito = professionalPatients.reduce((acc, patient) => patient.paymentMethod === 'Débito' ? acc + patient.value : acc, 0);

        // Sumar al total global
        totalEfectivoGlobal += totalEfectivo;
        totalDebitoGlobal += totalDebito;
        totalComisionesGlobales += professionalPatients.reduce((acc, patient) => acc + patient.commission, 0);
    });

    totalEfectivoGlobal += cajaChicaInicial;

    // Total de gastos y retiros globales
    const totalGastos = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const totalRetiros = withdrawals.reduce((acc, withdrawal) => acc + withdrawal, 0);

    // Calcular el total global
    const totalGlobal = totalEfectivoGlobal - totalComisionesGlobales - totalGastos - totalRetiros;

    // Crear la nueva ventana con todos los datos
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
  <html>
    <head>
        <title>Cierre de Caja ${cierreFecha}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #ffffff;
                color: #000000; /* Texto en negro en todo el documento */
                font-size: 12px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); /* Sombra más marcada */
            }
            th, td {
                border: 3px solid #000000; /* Bordes negros más gruesos */
                padding: 12px; /* Más espacio en las celdas */
                text-align: left;
                font-size: 14px; /* Aumentamos el tamaño de fuente */
                transition: background-color 0.3s ease;
            }
            th {
                background-color: #f1f1f1; /* Fondo gris claro para los encabezados */
                color: #000000; /* Texto negro */
                font-weight: bold;
                text-transform: uppercase; /* Mayúsculas para los títulos */
            }
            td {
                background-color: #ffffff; /* Fondo blanco para las celdas */
            }
            tr:nth-child(even) td {
                background-color: #f9f9f9; /* Color alterno en las filas (más visible) */
            }
            tr:nth-child(odd) td {
                background-color: #ffffff; /* Fondo blanco para filas impares */
            }
            tr:hover td {
                background-color: #eaeaea; /* Color de fondo al pasar el mouse */
            }
            h1 {
                display: flex;
                justify-content: space-between;
                align-items: center;
                text-transform: uppercase;
                color: #000000; /* Texto en negro */
                margin: 0;
                padding: 5px 0;
                font-size: 18px; /* Aumenta el tamaño del título */
                font-weight: bold;
            }
            .date {
                font-size: 16px; /* Aumenta el tamaño de la fecha */
                font-weight: bold;
                color: #333333; /* Color más suave para diferenciarla del título */
            }
            h2 {
                text-transform: uppercase;
                color: #000000; /* Texto negro */
                margin: 0;
                padding: 5px 0;
                font-size: 16px;
                font-weight: bold;
                text-align: center;
            }
            .flex-container {
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
            }
            .patients-container {
                flex: 3;
                min-width: 60%;
                border: 1px solid #ccc;
                padding: 10px;
            }
            .side-container {
                flex: 1;
                min-width: 30%;
                border: 1px solid #ccc;
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
        </style>
    </head>
    <body>
        <h1>
            Cierre de Caja
            <span class="date">${cierreFecha}</span>
        </h1>
        <div class="flex-container">
            <!-- Tabla de pacientes -->
            <div class="patients-container">
                <h2>Resumen de ${currentProfessional}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Operación</th>
                            <th>Valor</th>
                            <th>Forma de Pago</th>
                            <th>Comisión</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${professionalPatients.map(patient => `
                            <tr>
                                <td>${patient.name}</td>
                                <td>${patient.operation}</td>
                                <td>${patient.value}</td>
                                <td>${patient.paymentMethod}</td>
                                <td>${patient.commission}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <!-- Contenedor lateral -->
            <div class="side-container">
                <!-- Tabla de gastos -->
                <div class="expenses-container">
                    <h2>Resumen de Gastos</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expenses.map(expense => ` 
                                <tr>
                                    <td>${expense.description}</td>
                                    <td>$${expense.amount.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <!-- Tabla de totales del profesional -->
                <div class="totales-profesional">
                    <h2>Totales de ${currentProfessional}</h2>
                    <table>
                        <tr>
                            <th>Total en Efectivo</th>
                            <th>Total en Débito</th>
                            <th>Total de Comisiones</th>
                        </tr>
                        <tr>
                            <td>$${totalEfectivo}</td>
                            <td>$${totalDebito}</td>
                            <td>$${totalComisiones}</td>
                        </tr>
                    </table>
                </div>
                <!-- Tabla de totales globales -->
                <div class="totales-globales">
                    <h2>Totales Globales</h2>
                    <table>
                        <tr>
                            <th>Total en Efectivo (Todos los Profesionales):</th>
                            <td>$${totalEfectivoGlobal}</td>
                        </tr>
                        <tr>
                            <th>Total en Débito (Todos los Profesionales):</th>
                            <td>$${totalDebitoGlobal}</td>
                        </tr>
                        <tr>
                            <th>Total de Gastos:</th>
                            <td>$${totalGastos}</td>
                        </tr>
                        <tr>
                            <th>Total de Retiros:</th>
                            <td>$${totalRetiros}</td>
                        </tr>
                        <tr>
                            <th>Total de Comisiones de Profesionales:</th>
                            <td>$${totalComisionesGlobales}</td>
                        </tr>
                        <tr>
                            <th>Total:</th>
                            <td>$${totalGlobal}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </body>
    </html>
    `);
});


// Función para borrar todos los datos de localStorage
document.getElementById('clearData').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que deseas borrar todos los datos? Esta acción no se puede deshacer.')) {
        localStorage.clear();
        alert('Todos los datos han sido borrados.');
        location.reload(); // Recargar la página para reflejar los cambios
    }
});

// Agregar comportamiento para pasar al siguiente input al presionar Enter
const inputs = document.querySelectorAll('input, select');

inputs.forEach((input, index) => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evitar el comportamiento por defecto
            const nextInput = inputs[index + 1]; // Obtener el siguiente input
            if (nextInput) {
                nextInput.focus(); // Enfocar el siguiente input
            }
        }
    });
});

let cajaChicaInicial = 0;

// Función para guardar la Caja Chica Inicial
document.getElementById('saveCajaChica').addEventListener('click', function() {
    const cajaChicaInput = document.getElementById('cajaChicaInicial').value;
    if (!isNaN(cajaChicaInput) && cajaChicaInput !== '') {
        cajaChicaInicial = parseFloat(cajaChicaInput);
        // Agregar a pacientes como un "paciente" especial
        const cajaChicaPaciente = {
            name: 'Caja Chica Inicial',
            operation: '',
            value: cajaChicaInicial,
            paymentMethod: '',
            commission: 0
        };
        patients.unshift(cajaChicaPaciente); // Agregar al inicio de la lista
        localStorage.setItem(currentProfessional, JSON.stringify(patients));
        renderPatients(); // Actualizar la tabla
        document.getElementById('cajaChicaInicial').value = ''; // Limpiar el campo
    } else {
        alert('Por favor, ingresa un valor numérico válido para la Caja Chica Inicial.');
    }
});

// Mostrar Pacientes en la Tabla
function renderPatients() {
    const tbody = document.getElementById('patientTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Limpiar tabla

    // Agrupamos operaciones por paciente
    const groupedPatients = {};
    patients.forEach(patient => {
        if (!groupedPatients[patient.name]) {
            groupedPatients[patient.name] = [];
        }
        groupedPatients[patient.name].push(patient);
    });

    // Renderizar la tabla
    for (const [name, operations] of Object.entries(groupedPatients)) {
        operations.forEach((operation, index) => {
            const row = tbody.insertRow();

            // Insertar un checkbox antes del nombre
            const checkboxCell = row.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox'; // Hacer que el checkbox sea seleccionable
            checkboxCell.appendChild(checkbox);

            // Mostrar nombre
            const nameCell = row.insertCell(1);
            const nameInput = document.createElement('input');
            nameInput.value = (index === 0) ? name : ''; // Mostrar nombre solo en la primera operación
            nameInput.disabled = true; // Inicialmente deshabilitado
            nameInput.classList.add('editable-name'); // Añadir clase para identificar
            nameCell.appendChild(nameInput);

            // Mostrar operación
            row.insertCell(2).textContent = operation.operation || ''; // Mostrar operación

            // Mostrar valor editable
            const valueCell = row.insertCell(3);
            const valueInput = document.createElement('input');
            valueInput.value = operation.value.toFixed(2); // Mostrar valor con dos decimales
            valueInput.disabled = true; // Inicialmente deshabilitado
            valueInput.classList.add('editable-value'); // Añadir clase para identificar
            valueCell.appendChild(valueInput);

            // Mostrar forma de pago (editable)
            const paymentCell = row.insertCell(4);
            const paymentDisplay = document.createElement('span');
            paymentDisplay.textContent = operation.paymentMethod || 'Efectivo'; // Mostrar 'Efectivo' o 'Débito'
            paymentCell.appendChild(paymentDisplay);

            // Hacer que el valor sea editable al hacer clic en el texto
            paymentDisplay.onclick = () => togglePaymentMethod(operation, paymentDisplay);

            // Mostrar comisión
            row.insertCell(5).textContent = operation.commission.toFixed(2); // Mostrar comisión con dos decimales

            // Crear botón de "Editar"
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar'; // Cambiar a 'Editar'
            editButton.onclick = () => toggleEditMode(row, operations, nameInput, valueInput); // Llamar a la función de habilitar edición
            row.insertCell(6).appendChild(editButton); // Agregar botón a la celda

            // Crear botón para borrar operación
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Borrar'; // Cambiar a 'Borrar'
            deleteButton.onclick = () => deleteOperation(patients.indexOf(operation)); // Asociar acción de borrar
            row.insertCell(7).appendChild(deleteButton); // Agregar botón a la celda
        });
    }
}

// Función para cambiar entre Efectivo y Débito
function togglePaymentMethod(operation, paymentDisplay) {
    if (paymentDisplay.textContent === 'Efectivo') {
        paymentDisplay.textContent = 'Débito'; // Con tilde
        operation.paymentMethod = 'Débito'; // Guardar en la operación
    } else {
        paymentDisplay.textContent = 'Efectivo';
        operation.paymentMethod = 'Efectivo'; // Guardar en la operación
    }



    // Guardar los cambios en localStorage
    localStorage.setItem(currentProfessional, JSON.stringify(patients));
}

// Función para habilitar/deshabilitar los campos de nombre y valor
function toggleEditMode(row, operations, nameInput, valueInput) {
    // Cambiar el estado de los campos de texto
    if (nameInput.disabled) {
        nameInput.disabled = false;
        valueInput.disabled = false;
        row.getElementsByTagName('button')[0].textContent = 'Guardar'; // Cambiar texto del botón a "Guardar"
    } else {
        // Si se guarda, actualizar los valores
        const newName = nameInput.value;
        const newValue = parseFloat(valueInput.value);

        if (newName !== operations[0].name) {
            operations.forEach(op => op.name = newName); // Actualizar el nombre de todos los registros
        }

        if (newValue !== operations[0].value) {
            operations.forEach(op => op.value = newValue); // Actualizar el valor de todos los registros
        }

        // Guardar cambios en localStorage
        localStorage.setItem(currentProfessional, JSON.stringify(patients));

        // Cambiar el estado de los campos
        nameInput.disabled = true;
        valueInput.disabled = true;
        row.getElementsByTagName('button')[0].textContent = 'Editar'; // Cambiar texto del botón a "Editar"
    }
}

// Función para borrar una operación
function deleteOperation(index) {
    patients.splice(index, 1); // Eliminar la operación del array
    localStorage.setItem(currentProfessional, JSON.stringify(patients)); // Guardar cambios en localStorage
    renderPatients(); // Volver a renderizar la tabla
}





function deleteOperation(patientIndex) {
    patients.splice(patientIndex, 1); // Eliminar paciente de la lista
    localStorage.setItem(currentProfessional, JSON.stringify(patients)); // Guardar cambios en el localStorage
    renderPatients(); // Volver a renderizar la tabla
}

// Borrar un gasto específico
document.getElementById('delete-expense').addEventListener('click', function() {
    const expenseIndex = parseInt(prompt('Ingrese la posición del gasto a borrar (ej: 1, 2, 3):')) - 1; // Restar 1 para índice 0
    if (!isNaN(expenseIndex)) {
        if (expenseIndex >= 0 && expenseIndex < expenses.length) {
            const expenseDescription = expenses[expenseIndex].description; // Obtener la descripción del gasto a borrar
            const confirmDelete = confirm(`¿Estás seguro de que quieres borrar el gasto: "${expenseDescription}"?`);
            if (confirmDelete) {
                expenses.splice(expenseIndex, 1); // Eliminar gasto del array
                localStorage.setItem('expenses', JSON.stringify(expenses)); // Guardar cambios en localStorage
                alert(`El gasto "${expenseDescription}" en la posición ${expenseIndex + 1} ha sido borrado.`);
                updateExpenseTable(); // Asegúrate de que esta función esté definida
            }
        } else {
            alert('Por favor, ingrese una posición válida.');
        }
    } else {
        alert('Entrada no válida. Asegúrese de ingresar un número.');
    }
});




// Borrar todos los retiros
document.getElementById('clear-withdrawals').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que deseas borrar todos los retiros? Esta acción no se puede deshacer.')) {
        withdrawals = []; // Vaciar el array de retiros
        localStorage.setItem('withdrawals', JSON.stringify(withdrawals)); // Guardar cambios en localStorage
        alert('Todos los retiros han sido borrados.');
    }
});


document.getElementById('searchCommission').addEventListener('click', function() {
    const commissionToFind = parseFloat(document.getElementById('commissionCount').value);
    
    if (!isNaN(commissionToFind)) {
        let commissionCount = 0;
        
        // Filtramos las comisiones del profesional seleccionado
        patients.forEach(patient => {
            if (patient.commission === commissionToFind) {
                commissionCount++;
            }
        });
        
        document.getElementById('commissionResult').textContent = 
            `La comisión de $${commissionToFind.toFixed(2)} se repite ${commissionCount} ${commissionCount === 1 ? 'vez' : 'veces'} en ${currentProfessional}.`;
    } else {
        alert('Por favor ingrese un número válido.');
    }
});









