const fs = require('fs');
const path = require('path');
const md5dir = require('md5dir-sync');
const md5File = require('md5-file')

function setFileFolder() {
    var folderPath = document.getElementById("idFileFolder").files[0].path;
    document.getElementById("idTextFolder").value = folderPath;
}

function processFormFdf() {
    var folder = document.getElementById("idTextFolder").value;

    if(!fileExists(folder)) {
      $("#idTextFolder").popover('hide');
      $("#idTextFolder").popover({
        placement: "bottom", 
        trigger: "focus",
        content: 'Folder does not exist!'
      });
      $("#idTextFolder").popover('show');
      return false;
    }
    
    var folderProperties = {
      folder: "",
      nSubfolders: 0,
      nFiles: 0,
      folderSize: 0,
      checksum:0
    };

    folderProperties.folder = folder;
    dummyFolderProperties = getFolderProperties(folderProperties);
    
    return true;
}

function fileExists(filename){
  try{
    require('fs').accessSync(filename)
    return true;
  }catch(e){
    return false;
  }
}

function getFolderProperties(folderPropertiesInp) {
  var folderProperties = {
    folder: "",
    nSubfolders: 0,
    nFiles: 0,
    folderSize: 0,
    checksum: 0
  };

  folderProperties.folder = folderPropertiesInp.folder;

  var folderContents = fs.readdirSync(folderProperties.folder, 'utf8');
  
  folderContents.forEach(file => {
    var currentFolderContent = path.join(folderProperties.folder + '/' + file);

    try {
      if (fs.statSync(currentFolderContent).isFile()) {
        folderProperties.nFiles += 1;
        folderProperties.folderSize += fs.statSync(currentFolderContent).size;
        folderProperties.checksum = md5File.sync(currentFolderContent);
      }
      else {
        folderProperties.nSubfolders += 1;
        folderPropertiesInp.folder = currentFolderContent;
        
        subFolderProperties = getFolderProperties(folderPropertiesInp);
        folderProperties.nSubfolders += subFolderProperties.nSubfolders;
        folderProperties.nFiles += subFolderProperties.nFiles;
        folderProperties.folderSize += subFolderProperties.folderSize;
      }
    } catch (error) {
       console.log(error)
    }
  });

  folderProperties.checksum = md5dir(folderProperties.folder);

  console.log(folderProperties);

  document.write(folderProperties.folder);
  document.write("<br>");
  document.write(folderProperties.nSubfolders);
  document.write("<br>");
  document.write(folderProperties.nFiles);
  document.write("<br>");
  document.write(folderProperties.folderSize);
  document.write("<br>");
  document.write(folderProperties.checksum);
  document.write("<br>");

  return folderProperties;
}

function getFolderContent1(folder) {
  var nFiles;
  try {
    console.log(folder);
    var checksum = md5dir(folder);

    var stats = countFiles(folder, function (err, results) {
      console.log(results);
      filesCollection.push({
        currentFile: folder,
        nFiles: results.files,
        nSubfolders: results.dirs,
        folderSize: results.bytes,
        md5hash: checksum
      })
    }); 

    console.log('current count', stats);    
  } catch (error) {
    console.log(error)
  }  

  var folderContents = fs.readdirSync(folder, 'utf8');
  
  folderContents.forEach(file => {
    var currentFolderContent = path.join(folder + '/' + file);

    try {
      if (fs.statSync(currentFolderContent).isFile()) {  
        checksum = md5File.sync(currentFolderContent);
        var stats = countFiles(currentFolderContent, function (err, results) {
          filesCollection.push({
            currentFile: currentFolderContent,
            nFiles: results.files,
            nSubfolders: results.dirs,
            folderSize: results.bytes,
            md5hash: checksum
          })
        });
      }
      else {
        getFolderContent(currentFolderContent);
        nFiles += 1;
      }
    } catch (error) {
       console.log(error)
    }
  });
}