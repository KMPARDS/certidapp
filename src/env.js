const certificateStorageJSON = require('../build/CertificateStorage_CertificateStorage.json');

const network = 'kovan';
const certificateContract = {
  address: '0x3ECe25783491d8FC789B0E3ddF4Fa610843710CC',
  abi: certificateStorageJSON.abi
};

module.exports = { network, certificateContract };
