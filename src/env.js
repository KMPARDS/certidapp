const certificateStorageJSON = require('./compiledContracts/CertificateStorage_CertificateStorage.json');

const network = 'kovan';
const managerAddress = '0xc8e1f3b9a0cdfcef9ffd2343b943989a22517b26';

const certificateContract = {
  address: '0x3ECe25783491d8FC789B0E3ddF4Fa610843710CC',
  abi: certificateStorageJSON.abi
};

module.exports = { network, certificateContract, managerAddress };
