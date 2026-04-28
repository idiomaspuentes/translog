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
  