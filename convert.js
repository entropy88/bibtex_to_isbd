
/*This creates a global variable with the HTML element input in it. */
var input = document.getElementById("myFile");
/*This creates a global variable with the HTML element div with id output in it. */
var output = document.getElementById("output");
/* this 2 lines are used to set the source and the destination.
The first will get where you put your file, in this case it's the input element.
The second will get the div which content will be replaced by the content of your txt file. */
let exportContent = document.getElementById("exportContent");

/* Here we tell to our input element to do something special when his value changes.
A change will occur for example when a user will chose a file.*/
input.addEventListener("change", function () {
  /* First thing we do is checking if this.files exists and this.files[0] aswell.
  they might not exist if the change is going from a file (hello.txt) to no file at all  */
  if (this.files && this.files[0]) {
    /* Since we can chose more than one file by shift clicking multiple files, here we ensure that we only take the first one set. */
    var myFile = this.files[0];
    /* FileReader is the Object in the JavaScript standard that has the capabilities to read and get informations about files (content, size, creation date, etc) */
    var reader = new FileReader();

    /* Here we give the instruction for the FileReader we created, we tell it that when it loads, it should do some stuff. The load event is fired when the FileReader reads a file. In our case this hasn't happened yet, but as soon as it will this function will fire. */
    reader.addEventListener("load", function (e) {
      /* What we do here is take the result of the fileReader and put it inside our output div to display it to the users. This is where you could do your scrambling and maybe save the result in a variable ? */
      //   output.textContent = e.target.result;
      parseBib(e.target.result);
    });
    /* This is where we tell the FileReader to open and get the content of the file. This will fire the load event and get the function above to execute its code. */
    reader.readAsText(myFile);
  }
});

//parse the bibtex
function parseBib(bibcontent) {

  let recordsArray = bibcontent.split("@book");
  recordsArray.shift()
  console.log(recordsArray)
  //create empty array
  let bookObjects = [];
  recordsArray.forEach(record => {
    //create object
    let bookObject = {}

    let elements = record.match(/[\w]* = {([\s\S]*?)}/gm);
    console.log(elements);
    elements.forEach(e => {

      let meta = e.match(/[\w]* = /gm);
      console.log(meta);
      let metaString = meta[0];
      metaString = metaString.substring(0, metaString.length - 3)
      console.log(metaString);

      let content = e.match(/= {(.*?)\}/gm);
      let contentString = content[0];
      console.log(contentString)
      contentString = contentString.substring(3, contentString.length - 1)
      console.log(contentString);

      bookObject[metaString] = contentString;
  

    })
    //split authors
    let normalizedAuthors=bookObject.author.replaceAll(' and ','; ');
    bookObject.author=normalizedAuthors;
    console.log(normalizedAuthors)
    bookObjects.push(bookObject)
    console.log(bookObjects)
    //create isbd div and ps
    let bookDiv=document.createElement('div');
    bookDiv.classList.add("containerDiv");

    //getSignature
    let signatureP=document.createElement('p');
    signatureP.textContent=bookObject.signature;

    
    let isbdP = document.createElement("p");
    isbdP.classList.add('mainContent')
    let isbdString = `${bookObject.title}/ ${bookObject.author}. - ${bookObject.address}: ${bookObject.publisher}
    , ${bookObject.year}. - ${bookObject.pages}\n${bookObject.note}`;
    isbdP.textContent = isbdString;

    let note=document.createElement('p');
    note.classList.add('smaller');
    note.textContent=bookObject.note;
    
    //append to div
    bookDiv.appendChild(signatureP);
    bookDiv.appendChild(isbdP);
    bookDiv.appendChild(note);
    exportContent.appendChild(bookDiv);
  });
}


function Export2Word(element, filename = '') {
  var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
  var postHtml = "</body></html>";
  var html = preHtml + document.getElementById(element).innerHTML + postHtml;

  var blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });

  // Specify link url
  var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

  // Specify file name
  filename = filename ? filename + '.doc' : 'document.doc';

  // Create download link element
  var downloadLink = document.createElement("a");

  document.body.appendChild(downloadLink);

  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    // Create a link to the file
    downloadLink.href = url;

    // Setting the file name
    downloadLink.download = filename;

    //triggering the function
    downloadLink.click();
  }

  document.body.removeChild(downloadLink);
}

