// preload.js
const fs = require('fs');
const shell = require('electron') // deconstructing assignment
const fsPromises = fs.promises;
const imagesFolders = "./images";
const convertsFolders = "./convert";

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    let mainContent = document.querySelector('#mainContent');
    let convertButton = document.querySelector('#convertButton');
    let uploadButton = document.querySelector('#uploadButton');
    let jsProgressbar = document.querySelector('#js-progressbar');
    let inProgress = document.querySelector('#inProgress');
    let listFiles = document.querySelector('#listFiles');
    let preApp = document.querySelector('#preApp');
    let loading = document.querySelector('#loading');
    let textPreApp = document.querySelector('#textPreApp');
    let dellConvertButton = document.querySelector('#dellConvertButton');
    let readImagesFiles = [];
    let readConvertFiles = [];

    if (!fs.existsSync(imagesFolders)) {
        fs.mkdirSync(imagesFolders);
        readImagesFiles = fs.readdirSync(imagesFolders);
    } else {
        readImagesFiles = fs.readdirSync(imagesFolders);

    }

    if (!fs.existsSync(convertsFolders)) {
        fs.mkdirSync(convertsFolders);
        readConvertFiles = fs.readdirSync(convertsFolders);
    } else {
        readConvertFiles = fs.readdirSync(convertsFolders);

    }

    init();



    uploadButton.addEventListener('change', (event) => {
        console.log(event);
        console.log(event.target.files)
        mainContent.classList.add('uk-margin-medium-top');
        jsProgressbar.removeAttribute('hidden');
        inProgress.removeAttribute('hidden');
        let files = event.target.files;
        let uploadFiles = 0;
        console.log(files.length);

        if (files) {

            const upload = new Promise((resolve, reject) => {
                Array.from(files).forEach(file => {
                    fs.copyFile(file.path, imagesFolders + "/" + file.name, (err) => {
                        if (err) {
                            reject(false);
                        } else {
                            uploadFiles = ++uploadFiles
                            console.log(uploadFiles);
                            console.log(per(uploadFiles, files.length))
                            jsProgressbar.setAttribute('value', per(uploadFiles, files.length));
                            inProgress.innerHTML = "Upload in progress... " + file.name;

                            if (uploadFiles == files.length) {
                                resolve(true);
                            }
                        }
                    })
                });
            });

            upload.then(data => {
                if (data) {
                    console.log('Fichier upload');
                    inProgress.innerHTML = "Upload completed.";
                    setTimeout(() => {
                        mainContent.classList.remove('uk-margin-medium-top');
                        jsProgressbar.setAttribute('hidden', true);
                        inProgress.setAttribute('hidden', true);
                        uploadButton.setAttribute('hidden', true);
                        convertButton.removeAttribute('hidden');
                        uploadFiles = 0;
                        let readFiles = fs.readdirSync(imagesFolders);
                        readFiles.forEach((file) => {
                            listFiles.innerHTML += `<li>${file}</li>`
                        });
                        jsProgressbar.setAttribute('value', 0);
                    }, 500);

                }
            });
        }
    });

    convertButton.addEventListener('click', () => {
        if (!fs.existsSync(convertsFolders)) fs.mkdirSync(convertsFolders);
        let readImagesFiles = fs.readdirSync(imagesFolders);
        let copyFiles = 0;
        mainContent.classList.add('uk-margin-medium-top');
        jsProgressbar.removeAttribute('hidden');
        inProgress.removeAttribute('hidden');
        listFiles.innerHTML = "";

        const renameFiles = new Promise((resolve, reject) => {
            readImagesFiles.forEach(file => {
                fs.rename(imagesFolders + "/" + file, convertsFolders + "/" + file.toLowerCase(), (err) => {
                    if (err) {
                        reject(false);
                    } else {
                        copyFiles = ++copyFiles
                        console.log(copyFiles);
                        jsProgressbar.setAttribute('value', per(copyFiles, readImagesFiles.length));
                        inProgress.innerHTML = "Copy files... " + file;

                        if (copyFiles == readImagesFiles.length) {
                            resolve(true);
                        }
                    }
                })
            });
        });

        renameFiles.then(data => {
            if (data) {
                setTimeout(() => {
                    mainContent.classList.remove('uk-margin-medium-top');
                    jsProgressbar.setAttribute('hidden', true);
                    inProgress.setAttribute('hidden', true);
                    convertButton.setAttribute('hidden', true);
                    uploadButton.removeAttribute('hidden');
                    uploadFiles = 0;
                    listFiles.innerHTML = "<li>All files is converted.</li>";
                }, 1000);
            }

        })
    })

    dellConvertButton.addEventListener('click', () => {
        // let readConvertFiles = fs.readdirSync(convertsFolders);
        let deleteFilesCount = 0;
        mainContent.classList.add('uk-margin-medium-top');
        jsProgressbar.removeAttribute('hidden');
        inProgress.removeAttribute('hidden');
        listFiles.innerHTML = "";

        if (readImagesFiles.length > 0 && readConvertFiles.length === 0) {
            console.log('ici')
            const deleteFiles = new Promise((resolve, reject) => {
                readImagesFiles.forEach(file => {
                    fs.unlink(imagesFolders + "/" + file, (err) => {
                        if (err) {
                            reject(false);
                        } else {
                            deleteFilesCount = ++deleteFilesCount
                            console.log('deleteFilesCount', deleteFilesCount);
                            jsProgressbar.setAttribute('value', per(deleteFilesCount, readConvertFiles.length));
                            inProgress.innerHTML = "Deleting files... " + file;

                            if (deleteFilesCount == readImagesFiles.length) {
                                resolve(true);
                            }
                        }
                    })
                });
            });

            deleteFiles.then(data => {
                if (data) {
                    console.log('Delete here')
                    setTimeout(() => {
                        mainContent.classList.remove('uk-margin-medium-top');
                        jsProgressbar.setAttribute('hidden', true);
                        inProgress.setAttribute('hidden', true);
                        convertButton.setAttribute('hidden', true);
                        uploadButton.removeAttribute('hidden');
                        deleteFilesCount = 0;
                        listFiles.innerHTML = "<li>All files is deleted.</li>";

                        setTimeout(() => {
                            loading.removeAttribute('hidden');
                            listFiles.innerHTML = "";
                            dellConvertButton.setAttribute('hidden', true);
                            preApp.setAttribute('hidden', true);
                        }, 300);
                    }, 1000);
                }
            })
        }

        if (readConvertFiles.length > 0 && readImagesFiles.length === 0) {
            const deleteFiles = new Promise((resolve, reject) => {
                readConvertFiles.forEach(file => {
                    fs.unlink(convertsFolders + "/" + file, (err) => {
                        if (err) {
                            reject(false);
                        } else {
                            deleteFilesCount = ++deleteFilesCount
                            console.log('deleteFilesCount', deleteFilesCount);
                            jsProgressbar.setAttribute('value', per(deleteFilesCount, readConvertFiles.length));
                            inProgress.innerHTML = "Deleting files... " + file;

                            if (deleteFilesCount == readConvertFiles.length) {
                                resolve(true);
                            }
                        }
                    })
                });
            });

            deleteFiles.then(data => {
                if (data) {
                    console.log('Delete here')
                    setTimeout(() => {
                        mainContent.classList.remove('uk-margin-medium-top');
                        jsProgressbar.setAttribute('hidden', true);
                        inProgress.setAttribute('hidden', true);
                        convertButton.setAttribute('hidden', true);
                        uploadButton.removeAttribute('hidden');
                        deleteFilesCount = 0;
                        listFiles.innerHTML = "<li>All files is deleted.</li>";

                        setTimeout(() => {
                            loading.removeAttribute('hidden');
                            listFiles.innerHTML = "";
                            dellConvertButton.setAttribute('hidden', true);
                            preApp.setAttribute('hidden', true);
                        }, 300);
                    }, 1000);
                }
            })
        }


    })


    function per(num, amount) {
        return num * 100 / amount;
    }

    function init() {
        if (!fs.existsSync(imagesFolders)) fs.mkdirSync(imagesFolders);

        preApp.removeAttribute('hidden', true);

        setTimeout(() => {
            if (readImagesFiles.length > 0 && readConvertFiles.length == 0) {
                setTimeout(() => {
                    preApp.classList.remove("uk-margin-medium-top");
                    loading.setAttribute('hidden', true);
                    textPreApp.innerHTML = "Files is found in images folder.";
                    dellConvertButton.removeAttribute('hidden');
                }, 500);
            } else {
                if (readConvertFiles.length > 0 && readImagesFiles.length == 0) {
                    setTimeout(() => {
                        preApp.classList.remove("uk-margin-medium-top");
                        loading.setAttribute('hidden', true);
                        textPreApp.innerHTML = "Files is found in convert folder.";
                        dellConvertButton.removeAttribute('hidden');
                    }, 500);
                } else {
                    loading.setAttribute('hidden', true);
                    uploadButton.removeAttribute('hidden', true);
                    preApp.setAttribute('hidden', true);
                }
            }
        }, 500);

    }
})