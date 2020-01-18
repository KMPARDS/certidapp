const restler = require('restler');

const post = (url, z) => new Promise(function(resolve, reject) {
  restler.post(url, {
      multipart: true,
      data: {
        ...z,
        // address: '0x3dfcb407b3e3817427649829cb1b4b0eeba4b65e'
      }
  }).on('complete', function(data, response) {
      resolve(data)
  });
});

const get = (url, address) => new Promise(function(resolve, reject) {
  restler.get(url+'?address='+address).on('complete', function(data, response) {
      resolve(data)
  });
});

export { get, post };
