const axios = require('axios');
const fs = require('fs');

const username = 'indelibledata';
const repo = 'Indelible-Data-Test-Files';
const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents?ref=main`;

// Directories and files to ignore
const ignoreList = ['.github', '.gitattributes', 'README.md', 'generate-file-list.js'];

async function getFileList(directory = '') {
  try {
    const response = await axios.get(apiUrl + (directory ? `/${directory}` : ''));
    const fileList = {};

    for (const item of response.data) {
      if (item.type === 'dir' && !ignoreList.includes(item.name)) {
        fileList[item.name] = await getFileList(item.path);
      } else if (item.type === 'file') {
        if (!fileList[directory]) fileList[directory] = [];
        fileList[directory].push(item.name);
      }
    }

    return fileList;
  } catch (error) {
    console.error('Error generating file list:', error.message);
    return {};
  }
}

async function generateFileList() {
  const fileList = await getFileList();
  fs.writeFileSync('fileList.json', JSON.stringify(fileList, null, 2));
  console.log('File list generated successfully!');
}

generateFileList();
