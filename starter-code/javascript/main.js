fetch('./starter-code/javascript/data.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load data.json');
    return res.json();
  })
  .then(data => {
    initStorage(data);
    console.log('Storage initialized');
  })
  .catch(err => console.error(err));
