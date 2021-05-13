function doGet(e){

  var index = HtmlService.createHtmlOutputFromFile("index");

  
   return index.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);


}



function guardarArchivo(form){

  var carpeta = DriveApp.createFolder("Carpeta temporal")
  var archivo = carpeta.createFile(form.archivo)

  var nameArchivo = archivo.getName()
  
  try {

    nameArchivo = nameArchivo || "microsoft-excel.xlsx";

    var excelFile = DriveApp.getFilesByName(nameArchivo).next();
    var fileId = excelFile.getId();
    var folderId = Drive.Files.get(fileId).parents[0].id;
    var blob = excelFile.getBlob();
    var resource = {
      title: excelFile.getName(),
      mimeType: MimeType.GOOGLE_SHEETS,
      parents: [{id: folderId}],
    };

    Drive.Files.insert(resource, blob);

  } catch (f) {
    Logger.log(f.toString());
  }
  
  carpetaId = carpeta.getId();
  
  
  var idsheet= ListarHCGoogle(carpetaId);
  
  return idsheet;
  
  
  


  }



function ListarHCGoogle(carpetaId){


  var carpeta = DriveApp.getFolderById(carpetaId);

  var docs = carpeta.getFilesByType(MimeType.GOOGLE_SHEETS);

    while (docs.hasNext()) {

     var doc = docs.next();

      var idnueva= doc.getId();

    }
  
   var idFormulario = crearFormulario(idnueva)
  
   return idFormulario;

}
 


function crearFormulario(idSheet) {

  var sheet = SpreadsheetApp.openById(idSheet).getSheetByName('Hoja1');
  var lastRow = sheet.getLastRow(); //Obtiene la última fila
  var lastCol = sheet.getLastColumn(); //Obtiene la última columna

  var tituloForm= sheet.getRange(1,1).getValues()[0]; //Obtiene el valor del titulo de la primera celda
  var data = sheet.getDataRange().getValues(); //Rango de la información en el sheets
  var correos = sheet.getRange(1,2,1,lastCol).getValues()[0].filter(function(element) { return element != ''});

  var form = FormApp.create(tituloForm)  //Creación del formulario
       .setTitle(tituloForm);  


  data.forEach(function(item){ //Recorrer todas las filas
      item.forEach(function(elemento){  //Recorrer cada elemento del arreglo de las filas
    
        switch(elemento){
            case 'TEXTO':
                var requerido= true;

                if(item[2]=='NO'){
                  requerido = false;
                }
                form.addTextItem()  
                .setTitle(item[0])
                .setRequired(requerido);
                break;

            case 'MULTIPLE':
                var requerido= true;
                var opciones = item.slice(3,lastCol); //Obtiene todas las respuestas para la pregunta
                var filtrado = opciones.filter(function(element) { return element != ''}) //Elimina celdas vacias
                if(item[2]=='NO'){ 
                  requerido = false;
                }
                form.addMultipleChoiceItem()  
                .setTitle(item[0])
                .setChoiceValues(filtrado)
                .setRequired(requerido);
                break;        
            case 'CHECKBOX':
                var requerido= true;
                var opciones = item.slice(3,lastCol) //Obtiene todas las respuestas para la pregunta
                var filtrado = opciones.filter(function(element) { return element != ''}) //Elimina celdas vacias
                if(item[2]=='NO'){
                  requerido = false;
                }
                
                form.addCheckboxItem()  
                .setTitle(item[0]) 
                .setChoiceValues(filtrado)
                .setRequired(requerido);
                break;

            case 'LISTA': 
                var requerido= true;
                var opciones = item.slice(3,lastCol) //Obtiene todas las respuestas para la pregunta
                var filtrado = opciones.filter(function(element) { return element != ''}) //Elimina celdas vacias
                if(item[2]=='NO'){
                  requerido = false;
                }
                
                form.addListItem()  
                .setTitle(item[0]) 
                .setChoiceValues(filtrado)
                .setRequired(requerido);
                break;   
          }
        
    })
  })
  
   if(correos.length != 0 && correos[0] != 'CORREO DEL/LOS EDITOR/EDITORES'){
      if(correos.length == 1){
        form.addEditor(correos.toString());  

      }else{
        form.addEditors(correos);   
      }

    }
    
    



    //var url = form.getPublishedUrl();
    var url = form.getEditUrl();
  


    return url;
}


