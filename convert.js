/*This creates a global variable with the HTML element input in it. */
var input = document.getElementById("myFile");
/*This creates a global variable with the HTML element div with id output in it. */
var output = document.getElementById("output");
/* this 2 lines are used to set the source and the destination.
The first will get where you put your file, in this case it's the input element.
The second will get the div which content will be replaced by the content of your txt file. */
let exportContent = document.getElementById("exportContent");

let exportBtn=document.getElementById('exportBtn');
//starts disabled, gets enabled once content is parsed
exportBtn.disabled=true;

let query = document.getElementById('query');
let user = document.getElementById('user');

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
  //create empty array
  let bookObjects = [];

  let recordsArray = bibcontent.split("@book");
  recordsArray.shift()
  console.log(recordsArray)

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
    //split authors IF THERE ARE ANY
    if (bookObject.author) {
      let normalizedAuthors = bookObject.author.replaceAll(' and ', '; ');
      bookObject.author = normalizedAuthors;
    } else {
      //if there aren't authors!
      bookObject.author = '';
    }

    //assign type,default is book
    bookObject.type = 'book';

    bookObjects.push(bookObject);

  });

  //sort books by main entry and then append
  let records = bookObjects.sort((a, b) => a.main.localeCompare(b.main))

  //enable exportBtn
  exportBtn.disabled=false;

  console.log(records)





  //create separate arrays for books and articles
  let bookRecords = [];
  let articleRecords = [];

  records.forEach(bookObject => {
  
    let isbdString = "default";

    //define type og record

    if (bookObject.hasOwnProperty('journal')) {
      bookObject.type = "analytical";
      articleRecords.push(bookObject);

    } else {
      bookRecords.push(bookObject);
    }
    console.log(bookRecords.length);
    console.log(articleRecords.length);
  })


 

  //visualise articles
  let articlesDiv = document.createElement('div');
  let articlesLabel = document.createElement('p');
  articlesLabel.textContent = `Статии: ${articleRecords.length}`;
  articlesLabel.classList.add('bolded')
  articlesDiv.appendChild(articlesLabel);
  articleRecords.forEach(r => {
    let articleContainer = document.createElement('div');
    //main entry
    appendMainEntry(articleContainer, r)
    isbdString = `${r.title}/ ${r.author}. - В: ${r.journal}. - ${r.number}, (${r.year}), с. ${r.pages}`;
    let articleP = document.createElement('p');
    articleP.textContent = isbdString;
    articleContainer.appendChild(articleP)
    articlesDiv.appendChild(articleContainer);
  })


  //visualise books
  let booksDiv = document.createElement('div');
  let booksLabel = document.createElement('p');
  booksLabel.textContent = `Книги: ${bookRecords.length}`;
  booksLabel.classList.add('bolded');
  booksDiv.appendChild(booksLabel);
  bookRecords.forEach(r => {
    let bookContainer = document.createElement('div');
    //signature
    if (r.hasOwnProperty('signature')) {
      //getSignature
      let signatureP = document.createElement('p');
      signatureP.textContent = r.signature;
      bookContainer.appendChild(signatureP);
    }
    //main entry
    appendMainEntry(bookContainer, r)
    isbdString = `${r.title}/ ${r.author}. - ${r.address}: ${r.publisher}, ${r.year}. - ${r.pages}`;
    let bookP = document.createElement('p');
    bookP.textContent = isbdString;
    bookContainer.appendChild(bookP);
    //note
    appendNote(bookContainer, r)

    booksDiv.appendChild(bookContainer);
  })

  //clean the container
  exportContent.innerHTML='';
   //add query
   let queryP = document.createElement('p');
   queryP.textContent = `Тема на справката: ${query.value}`;
   exportContent.appendChild(queryP);

         //add number of resources
         let resourcesP = document.createElement('p');
         resourcesP.textContent = `Брой източници: ${records.length}\n Книги:${bookRecords.length}; Статии: ${articleRecords.length}`;
         exportContent.appendChild(resourcesP);

   //add date
     //add date
  let dateP = document.createElement('p');
  const date = new Date();

  // ✅ DD/MM/YYYY
  const result1 = new Date().toLocaleDateString('en-GB');
  console.log(result1); // 👉️ 24/07/2023
  dateP.textContent = `Дата: ${result1}`
  exportContent.appendChild(dateP);



   //add user
   let userP= document.createElement('p');
   userP.textContent=`Изготвил: ${user.value}`;
   exportContent.appendChild(userP)
  exportContent.appendChild(booksDiv)
  exportContent.appendChild(articlesDiv);
}

function appendNote(container, recordObject) {
  if (recordObject.hasOwnProperty('note')) {
    console.log('hasNote');
    let noteP = document.createElement('p');
    noteP.classList.add('smaller');
    noteP.textContent = recordObject.note;
    container.appendChild(noteP)
  }
}

function appendMainEntry(container, recordObject) {
  let mainEntryP = document.createElement('p');
  mainEntryP.classList.add('mainEntry');
  mainEntryP.textContent = recordObject.main;
  container.appendChild(mainEntryP);
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