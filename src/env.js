const certificateStorageJSON = require('./compiledContracts/CertificateStorage_CertificateStorage.json');

const network = 'kovan';
const managerAddress = '0xc8e1f3b9a0cdfcef9ffd2343b943989a22517b26';

const certificateContract = {
  address: '0x88B3F535fe402fC3Cf1f7e7FBEaf1197c8ebFA9e',
  abi: certificateStorageJSON.abi
};

const TX_STATUS_ENUM = {
  NOT_INITIATED: 0,
  SIGNING: 1,
  WAITING_FOR_CONFIRMATION: 2,
  CONFIRMED: 3
}

module.exports = { network, certificateContract, managerAddress, TX_STATUS_ENUM };
