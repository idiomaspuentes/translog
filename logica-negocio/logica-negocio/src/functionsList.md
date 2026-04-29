# Lista de todas las funciones:

## Funciones de ayuda

*   getAll(nombreTabla): Obtiene todos los datos de una tabla. 

## Lenguaje

*   saveLanguage({ code, name }): Guarda un nuevo idioma en la DB.
*   getLanguageByCode(langCode): Obtiene el objeto del idioma, usando el código de parámetro.
*   searchLanguages(Query): Filtra los idiomas que empiecen por el Query. Tanto por los códigos como nombres.

## Libro

*   saveBook({ code, name, langCode, version }): Guarda un nuevo libro en la DB.
*   listBooksByLang(langCode): Obtiene una lista de libros para un idioma en específico.
*   getBook(bookCode, langCode): Obtiene un libro sabiendo su bookCode y su idioma.
*   getBooks(): Obtiene una lista de todos los libros activos. (sin archivar)
*   getBookCodes(): Obtiene una lista de todos los códigos de los libros activos.
*   handleImportBook(langCode, langName): Agrega un libro a la DB a partir de un archivo USFM.
*   archiveBook(bookCode, langCode): Archiva un libro y de esa forma el libro no es borrado, pero tampoco exportado ni se muestra en la app junto con los libros activos.
*   searchBooksByTitle(Query):  Filtra los books que empiecen por el Query. Tanto por los códigos como nombres.
  
## Sesión

*   getSession(sessionId): Trae una sesion con los reviews y todo pero solamente el numero de comentarios.
*   createSession(bookId): Crea una sesion vacia solamente con id y start date.
*   closeSession(sessionId): Asigna el enddate a la sesion.
*   saveSession({ bookId, title, startDate, endDate, bookId }): Guarda una nueva sesión en la DB. (mejor para importar)
*   listSessionsByBookId(bookId): Obtiene una lista de sesiones por un libro específico.
*   searchSessionsByTitle(query):  Filtra las sesiones que incluyan el Query.
  
##  Revisiones

*   createReview(sessionId, reviewData): Crea un review vacio con id o con los datos que le mandes.
*   saveReview({ sessionId, text, reference: { chapterStart, verseStart, chapterEnd, verseEnd } }): Guarda una nueva review en la DB.
*   listReviewsBySession(sessionId): Obtiene una lista de revisiones por una sesión específica.
*   getReview(reviewId): Obtiene una review por su id.
  
## Comentarios

*   saveComment(reviewId, { text, author }): Guarda un nuevo comentario en la DB.
*   listCommentsByReview(reviewId): Obtiene una lista de comentarios por una revisión específica.
  
## Exportar

*   getFullExportJSON(): Exporta un archivo JSON con todos los datos de la DB sin los libros archivados.