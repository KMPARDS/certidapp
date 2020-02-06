const certificateStorageJSON = require('./compiledContracts/CertiDApp_CertiDApp.json');

const env = {
  network:
    // 'kovan'
    'homestead'
  ,
  certificateContract: {
    address: '0x3ea996e3A2f2A8b235065a7Fa5d55e5f626f0003',
    abi: certificateStorageJSON.abi
  },
  dataTypes: [null, 'bytes', 'number', 'float', 'string', 'boolean', 'base58', 'date', 'datetime'],
  certOrder: ['name', 'subject', 'score', 'category'],
  authOrder: ['name', 'website'],
  extraDataTypes: { ///comments // recommendations //file //expires
    image: 'base58',
    file: 'base58',
    url: 'string',
    date: 'date',
    date2: 'date',
    location: 'string',
    datetime: 'datetime',
    datetime2: 'datetime',
    comments: 'string'
  },
  extraDataKeysExample: {
    url: 'google.com',
    comments: 'Student was very hardworking.',
    location: 'Institute Hall, IIEST Shibpur, Howrah'
  },
  dataTypesExample: {
    base58: 'IPFS Hash like QmQ9kasfzNTwbxGXSRyCp1WFdBXScpHNKDjrUPSWw3VR4z',
    date: 'DD/MM/YYYY like 23/01/2020',
    datetime: 'Unix timestamp like 1580476565'
  },
  managerAddress: '0xc8e1f3b9a0cdfcef9ffd2343b943989a22517b26',
  TX_STATUS_ENUM: {
    NOT_INITIATED: 0,
    SIGNING: 1,
    WAITING_FOR_CONFIRMATION: 2,
    CONFIRMED: 3
  },
  AUTHORITY_STATUS_ENUM: {
    NOT_AUTHORISED: 0,
    AUTHORISED: 1,
    MIGRATED: 2,
    SUSPENDED: 3
  },
  METAMASK_ENUM: {
    NOT_INSTALLED: 0,
    INSTALLED_BUT_NOT_CONNECTED: 1,
    CONNECTED: 2,
    OTHER_NETWORK: 3
  }
};

if(env.network === 'homestead') {
  env.certificateContract.address = '0x42270341CDca6eE703F98529c3F0C538F5369C2a';
}

switch (env.network) {
  case 'homestead':
    env.networkId = 1;
    break;
  case 'kovan':
    env.networkId = 42;
    break;
}

module.exports = env;
