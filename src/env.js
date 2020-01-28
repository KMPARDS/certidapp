const certificateStorageJSON = require('./compiledContracts/CertificateStorage_CertificateStorage.json');

const env = {
  network: 'kovan',
  certificateContract: {
    address: '0x34AEA1D67C5484133BeE0E60aEbB9882a772f64B',
    abi: certificateStorageJSON.abi
  },
  dataTypes: [null, 'bytes', 'number', 'float', 'string', 'boolean', 'image', 'date'],
  certOrder: ['name', 'subject', 'score', 'category'],
  authOrder: ['name', 'website'],
  managerAddress: '0xc8e1f3b9a0cdfcef9ffd2343b943989a22517b26',
  TX_STATUS_ENUM: {
    NOT_INITIATED: 0,
    SIGNING: 1,
    WAITING_FOR_CONFIRMATION: 2,
    CONFIRMED: 3
  },
};

module.exports = env;
