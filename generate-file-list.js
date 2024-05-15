const axios = require('axios');
const fs = require('fs');

const username = 'indelibledata';
const repo = 'Indelible-Data-Test-Files';
const mainUrl = `https://api.github.com/repos/${username}/${repo}/contents`;
const ignoreList = ['package.json', 'package-lock.json', 'generate-file-list.js', 'fileList.json', 'README.md', '.gitattributes', 'node_modules/*'];

async function getFileList(directory = '', parentPath = '') {
  try {
    const fullPath = parentPath ? `${parentPath}/${directory}` : directory;
    const response = await axios.get(`${mainUrl}/${fullPath}?ref=main`);
    const directoryData = {
      name: directory || repo,
      path: fullPath || '/',
      type: 'dir',
      files: []
    };

    for (const item of response.data) {
      if (ignoreList.some(pattern => new RegExp(pattern).test(item.name))) {
        continue;
      }

      if (item.type === 'dir') {
        const subFiles = await getFileList(item.name, fullPath);
        directoryData.files.push(subFiles);
      } else if (item.type === 'file') {
        directoryData.files.push({
          name: item.name,
          path: item.path,
          sha: item.sha,
          size: item.size,
          url: item.url,
          html_url: item.html_url,
          git_url: item.git_url,
          download_url: item.download_url,
          type: item.type,
          _links: item._links
        });
      }
    }

    return directoryData;
  } catch (error) {
    console.error('Error generating file list:', error.message);
    return [];
  }
}

async function generateFileList() {
  const fileList = await getFileList();
  fs.writeFileSync('fileList.json', JSON.stringify(fileList, null, 2));
  console.log('File list generated successfully!');
}

generateFileList();
