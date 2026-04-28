IndexedDB colecciones

- idiomas (codigo y nombre de idioma "Tito", "TIT", libros)
    - libro (nombre del libro, contenido del libro, <!-- codigo del libro --> y codigo del idioma y sesiones)
        - sesion {id, titulo, libro, fechaInicio, fechaCierre date/time, [revisiones]}
            - revision (texto, ref, fecha date/time, comentarios)
                - comentario (fecha, autor, texto)
  

  exportar json pero sin el contenido del libro, pero si la version

  * agregar campo de version
  * hacer funcion de getBooks
  * getbook(bookcode, lang) me devuelve todo los datos menos las sesiones o revisiones que tenga el libro
  * addBook(usfm)
  * hacer lista de idiomas disponibles y hacer select
  * cargar archivo para que el usfm sea asi 
  *  eliminar libro archiveBook()
  * crear logBooks();
  * getBookSessions() junto con sus revisiones, pero de los comentarios solamente tener un contador de cuantos comentarios hay
  * getReview(id (este es el session id), bookId)

  - funcion de busqueda de idiomas, todos los que hagan a un string, que devuelva nombre y codigo
  