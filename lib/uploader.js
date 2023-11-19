const FormData = require('form-data');
const ft = require('file-type');
const fetch = require('node-fetch');

async function uploader(buffer) {
  const { ext } = await ft.fromBuffer(buffer);
  let form = new FormData();
  form.append('file', buffer, 'tmp.' + ext);
  let res = await fetch('https://cdn.btch.bz/upload', {
    method: 'POST',
    body: form,
  });
  let img = await res.json();
  if (img.error) throw img.error;
  let results = 'https://cdn.btch.bz' + img[0].src;
  return results;
}

module.exports = { uploader }