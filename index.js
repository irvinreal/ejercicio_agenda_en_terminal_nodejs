import fs from 'node:fs/promises';
import readline from 'node:readline/promises';

(function myAgenda() {
  let contacts = [];

  // Creating the readline to read the prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Initial output
  function init() {
    console.log('\n1. Buscar contacto');
    console.log('2. Crear contacto');
    console.log('3. Actualizar contacto');
    console.log('4. Eliminar contacto');
    console.log('5. Mostrar todos los contactos');
    console.log('6. Salir');
    console.log('Selecciona una opción: ');
  }
  init();

  rl.on('line', (line) => {
    switch (line.trim()) {
      case '1':
        buscarContacto();
        break;
      case '2':
        crearContacto();

        break;
      case '3':
        actualizarContacto();
        break;
      case '4':
        eliminarContacto();
        break;
      case '5':
        mostrarTodosLosContactos();
        break;
      case '6':
        salir();
        break;
      default:
        console.log(`Elige una opción del 1 al 5`);
        break;
    }
  }).on('close', () => {
    console.log('Exit');
    salir();
  });

  async function mostrarTodosLosContactos() {
    let DBContactos = (await contactosBaseDatos()) || [];

    if (DBContactos.length === 0) {
      console.log('\n-- No hay contactos guardados -- \n\n');
      return init();
    }

    console.log(DBContactos);
    init();
  }

  async function buscarContacto() {
    const answeredName = await preguntarNombre();

    let DBContactos = (await contactosBaseDatos()) || [];

    const contact = DBContactos.filter((cont) => cont.name === answeredName);
    if (contact.length === 0) {
      console.log('No existe ningun contacto con el nombre que ingresaste');
      return init();
    }
    console.log(contact[0]);
    init();
  }

  async function crearContacto() {
    const newContacto = {
      name: '',
      phone: ''
    };

    let DBContactos = (await contactosBaseDatos()) || [];

    const answeredName = await preguntarNombre();

    // Verificar que no exista ese nombre en la base de datos
    const contact = DBContactos.filter((cont) => cont.name === answeredName);
    if (contact.length > 0) {
      console.log(
        '\n-- Ya existe un contacto con ese nombre. Por favor elige otro nombre --'
      );
      return init();
    }

    newContacto.name = answeredName;

    let answeredNumber = await preguntarNumero('Ingresa el número de teléfono');

    if (answeredNumber === '') {
      answeredNumber = await preguntarNumero(
        '\n-- Este campo no debe estar vacío. Introduce el número de teléfono --'
      );
    }
    const isNumber = parseInt(answeredNumber);
    if (isNaN(isNumber)) {
      answeredNumber = await preguntarNumero('\n-- Ingresa sólo numeros --');
    }

    if (answeredNumber.toString().length !== 10) {
      answeredNumber = await preguntarNumero(
        '\n-- El número de teléfono debe contener 10 caracteres --'
      );
    }

    newContacto.phone = answeredNumber;

    // Agregar contacto nuevo a base de datos
    contacts = [...DBContactos];
    contacts.push(newContacto);
    const contactsString = JSON.stringify(contacts);
    await fs.writeFile('db.json', contactsString, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    console.log(newContacto);
    init();
  }

  async function actualizarContacto() {
    const answeredName = await preguntarNombre();

    const DBContactos = await contactosBaseDatos();

    const contact = DBContactos.filter((cont) => cont.name === answeredName);

    if (contact.length === 0) {
      console.log('No existe ningun contacto con el nombre que ingresaste');
      return init();
    }

    const nombreOTelefono = await rl.question(
      `Selecciona la opción que deseas actualizar \n\n1. Nombre \t2. Número de teléfono\n`
    );

    switch (nombreOTelefono) {
      case '1':
        // Actualizar el nombre
        const newName = await preguntarNombre();
        let newContact = contact[0];
        newContact.name = newName;

        contacts = [
          ...DBContactos.filter(
            (cont) => cont.name !== answeredName && cont.name !== newName
          ),
          newContact
        ];

        break;
      case '2':
        // Actualizar el nombre
        let answeredNumber = await preguntarNumero(
          'Ingresa el número de teléfono'
        );
        let newContacto = contact[0];
        newContacto.phone = answeredNumber;

        contacts = [
          ...DBContactos.filter((cont) => cont.name !== answeredName),
          newContacto
        ];
        console.log(contacts);

        break;
      default:
        console.log(`Sólo puedes elegir la opción 1 o 2`);
        break;
    }
    const strContacts = JSON.stringify(contacts);

    await fs.writeFile('db.json', strContacts, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });

    init();
  }

  async function eliminarContacto() {
    const answeredName = await preguntarNombre();

    const DBContactos = await contactosBaseDatos();

    const contact = DBContactos.filter((cont) => cont.name === answeredName);

    if (contact.length === 0) {
      console.log('No existe ningun contacto con el nombre que ingresaste');
      return init();
    }

    let newDBContactos = DBContactos.filter(
      (cont) => cont.name !== answeredName
    );

    const strNewDBContactos = JSON.stringify(newDBContactos);

    await fs.writeFile('db.json', strNewDBContactos, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });

    console.log(DBContactos);
    console.log(newDBContactos);

    init();
  }

  async function preguntarNombre() {
    return await rl.question('Introduce el nombre \n');
  }
  async function preguntarNumero(msj) {
    return await rl.question(`${msj} \n`);
  }

  async function contactosBaseDatos() {
    try {
      const strDBContacts = await fs.readFile('db.json', { encoding: 'utf-8' });
      const parsedDBContacts = JSON.parse(strDBContacts);
      return parsedDBContacts;
    } catch (error) {
      return [];
    }
  }

  function salir() {
    console.log('Saliste ❌');
    process.exit(0);
  }
})();
