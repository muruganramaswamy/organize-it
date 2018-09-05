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

  document.getElementById("idProgressContent").textContent = folderPropertiesInp.folder;
  document.getElementById("idProgressContent").show;

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
    
  return folderProperties;
}