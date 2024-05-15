const axios = require('axios');
const fs = require('fs');

const username = 'indelibledata';
const repo = 'Indelible-Data-Test-Files';
const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents?ref=main`;

async function getFileList() {
  try {
    const response = await axios.get(apiUrl);
    const fileList = {};

    for (const item of response.data) {
      if (item.type === 'dir') {
        const directoryUrl = `${apiUrl}/${item.name}`;
        const directoryResponse = await axios.get(directoryUrl);
        const files = directoryResponse.data.map(file => file.name);
        fileList[item.name] = files;
      }
    }

    fs.writeFileSync('fileList.json', JSON.stringify(fileList));
    console.log('File list generated successfully!');
  } catch (error) {
    console.error('Error generating file list:', error.message);
  }
}

getFileList();
