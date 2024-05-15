const axios = require('axios');
const fs = require('fs');

const username = 'indelibledata';
const repo = 'Indelible-Data-Test-Files';
const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents?ref=main`;

async function getFileList(directory = '') {
  try {
    const response = await axios.get(apiUrl + (directory ? `/${directory}` : ''));
    const fileList = [];

    for (const item of response.data) {
      if (item.type === 'dir') {
        const files = await getFileList(item.path);
        fileList.push(...files);
      } else if (item.type === 'file') {
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
