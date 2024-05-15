const axios = require('axios');
const fs = require('fs');

const username = 'indelibledata';
const repo = 'Indelible-Data-Test-Files';
const mainUrl = `https://api.github.com/repos/${username}/${repo}/contents`;
const ignoreList = ['package.json', 'package-lock.json', 'generate-file-list.js', 'fileList.json', 'README.md', '.gitattributes', 'node_modules/*'];

async function getFileList(directory = '') {
  try {
    const response = await axios.get(`${mainUrl}/${directory}?ref=main`);
    const fileList = [];

    for (const item of response.data) {
      if (item.type === 'dir') {
        if (!ignoreList.some(pattern => item.name.match(new RegExp(pattern)))) {
          const subFiles = await getFileList(`${directory}/${item.name}`);
          fileList.push(...subFiles);
        }
      } else if (item.type === 'file' && !ignoreList.some(pattern => item.name.match(new RegExp(pattern)))) {
        fileList.push({
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

    return fileList;
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
