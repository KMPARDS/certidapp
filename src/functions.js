import { dataTypes, certOrder, authOrder } from './env';

const ethers = require('ethers');

export function bytesToString(bytes) {
  return ethers.utils.toUtf8String(bytes).split('\u0000').join('');
}

export function parsePackedAddress(packedAddresses) {
  if(packedAddresses.slice(0,2).toLowerCase() === '0x') packedAddresses = packedAddresses.slice(2);
  if(packedAddresses.length%40 !== 0) throw new Error('Invalid packed addresses');
  const addressArray = [];
  for(let i = 0; i < packedAddresses.length/40; i++) {
    addressArray.push('0x'+packedAddresses.slice(0+40*i,40+40*i));
  }
  return addressArray;
}

export function getDataTypeHexByte(type) {
  const index = dataTypes.indexOf(type);
  if(index === -1) throw new Error('Invalid certificate data type: ' + type);
  return index.toString(16);
}

export function guessDataTypeFromInput(input) {
  switch(typeof input) {
    case 'string':
      if(input.slice(0,2) === '0x') {
        return 'bytes';
      }
      return 'string';
    case 'number':
      if(String(input).split('.')[1]) {
        return 'float';
      }
      return 'number';
    default:
      return typeof input;
  }
}

// remaining for image and data
// take number or string and convert it into bytes
export function bytify(input, type) {
  switch(type || guessDataTypeFromInput(input)) {
    case 'bytes':
      return input;
    case 'number':
      let hex = Number(input).toString(16);
      if(hex.length % 2 !== 0) {
          hex = '0'+hex;
      }
      return '0x' + hex;
    case 'float':
      const numberOfDecimals = (String(input).split('.')[1] || '').length;
      const decimalByte = bytify(numberOfDecimals, 'number').slice(2);
      if(decimalByte.length !== 2) throw new Error(`Invalid decimal byte: (${decimalByte})`);
      const numberWithoutDecimals = input * 10**numberOfDecimals;
      const numberBytes = bytify(numberWithoutDecimals, 'number').slice(2);
      return '0x' + decimalByte + numberBytes;
    case 'string':
      return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(input));
    case 'boolean':
      return input ? '0x01' : '0x00';
    default:
      return null;
  }
}

export function renderBytes(hex, type) {
  switch(type) {
    case 'bytes':
      return hex;
    case 'number':
      if(hex === '0x') return null;
      return +hex;
    case 'float':
      if(hex === '0x') return null;
      const decimals = +('0x'+hex.slice(2,4));
      const number = +('0x'+hex.slice(4));
      return number / 10**decimals;
    case 'string':
      return bytesToString(hex);
    case 'boolean':
      return !!(+hex);
    default:
      return hex;
  }
}

export function isProperValue(input) {
  return ![undefined, null, NaN].includes(input);
}

export function getCertificateHashFromDataRLP(certificateDataRLP) {
  const digest = ethers.utils.hexlify(ethers.utils.concat([ethers.utils.toUtf8Bytes('\x19Ethereum Signed Message:\n'+(certificateDataRLP.length/2 - 1)),certificateDataRLP]));
  return ethers.utils.keccak256(digest);
}

export function encodeCertificateObject(obj, signature = []) {
  let signatureArray = typeof signature === 'object' ? signature : [signature];
  const entries = Object.entries(obj);
  const certRLPArray = [];

  // adding name and subject into rlpArray
  certOrder.forEach(property => {
    if(property === 'score') {
      // adding score into rlpArray
      if(isProperValue(obj['score'])) {
        certRLPArray.push(bytify(+obj['score'], 'float'));
      } else {
        certRLPArray.push('0x');
      }
    } else {
      const hex = isProperValue(obj[property]) ? bytify(obj[property]) : '0x';
      certRLPArray.push(hex);
    }
  });

  const extraData = entries.filter(property => !certOrder.includes(property[0]) && isProperValue(property[1]));

  if(extraData.length) {
    // pushing datatype storage of the extra datas
    certRLPArray.push('');
    const datatypeIndex = certRLPArray.length - 1;
    extraData.forEach(property => {
      certRLPArray[datatypeIndex] = certRLPArray[datatypeIndex] + getDataTypeHexByte(guessDataTypeFromInput(property[1]));
      certRLPArray.push([bytify(property[0]), bytify(property[1])]);
    });

    if(certRLPArray[datatypeIndex].length % 2) {
      certRLPArray[datatypeIndex] = certRLPArray[datatypeIndex] + '0';
    }

    certRLPArray[datatypeIndex] = '0x' + certRLPArray[datatypeIndex];
  }

  // console.log(certRLPArray);
  const dataRLP = ethers.utils.RLP.encode(certRLPArray);
  return {
    fullRLP: ethers.utils.RLP.encode([certRLPArray, ...signatureArray]),
    dataRLP,
    certificateHash: getCertificateHashFromDataRLP(dataRLP)
  };
}

export function addSignaturesToCertificateRLP(encodedFullCertificate, signature = []) {
  let signatureArray = typeof signature === 'object' ? signature : [signature];
  let certificateData;
  if(typeof encodedFullCertificate === 'object') {
    certificateData = ethers.utils.RLP.decode(encodedFullCertificate.dataRLP);
  } else {
    const decoded = ethers.utils.RLP.decode(encodedFullCertificate);
    certificateData = decoded[0];
    if(decoded.length > 1) {
      signatureArray = [...decoded.slice(1), ...signatureArray];
    }
  }
  // console.log({signatureArray});
  const dataRLP = ethers.utils.RLP.encode(certificateData);

  return {
    fullRLP: ethers.utils.RLP.encode([certificateData, ...signatureArray]),
    dataRLP,
    certificateHash: getCertificateHashFromDataRLP(dataRLP)
  };
}

export function decodeCertificateData(encodedCertificate) {
  let fullRLP = typeof encodedCertificate === 'object' ? encodedCertificate.fullRLP : encodedCertificate;
  const decoded = ethers.utils.RLP.decode(fullRLP);
  const parsedCertificate = {};

  let decodedCertificatePart, signatureArray;
  //checking if decoded is of fullRLP or certificate data part
  if(typeof decoded[0] === 'string') {
    decodedCertificatePart = decoded;
  } else {
    decodedCertificatePart = decoded[0];
    signatureArray = decoded.slice(1);
  }

  decodedCertificatePart.forEach((entry, i) => {
    if(i < certOrder.length) {
      if(certOrder[i] !== 'score') {
        parsedCertificate[certOrder[i]] = ethers.utils.toUtf8String(entry);
      } else {
        parsedCertificate[certOrder[i]] = renderBytes(entry, 'float');
      }
    } else if(i > certOrder.length){
      const type = dataTypes[+('0x'+decodedCertificatePart[certOrder.length].slice(1+i-certOrder.length, 2+i-certOrder.length))];
      // console.log({value: entry[1], type});
      parsedCertificate[bytesToString(entry[0])] = renderBytes(entry[1], type);
    }
  });

  const returnObj = { parsedCertificate };

  returnObj.certificateHash = getCertificateHashFromDataRLP(ethers.utils.RLP.encode(decodedCertificatePart));

  if(signatureArray) {
    returnObj.signatures = signatureArray;
  }

  return returnObj;
}

export function encodeCertifyingAuthority(obj) {
  const entries = Object.entries(obj);
  const rlpArray = [];

  authOrder.forEach(property => {
    const hex = isProperValue(obj[property]) ? bytify(obj[property]) : '0x';
    rlpArray.push(hex);
  });

  const extraData = entries.filter(property => !authOrder.includes(property[0]) && isProperValue(property[1]));

  if(extraData.length) {
    // pushing datatype storage of the extra datas
    rlpArray.push('');
    const datatypeIndex = rlpArray.length - 1;
    extraData.forEach(property => {
      rlpArray[datatypeIndex] = rlpArray[datatypeIndex] + getDataTypeHexByte(guessDataTypeFromInput(property[1]));
      rlpArray.push([bytify(property[0]), bytify(property[1])]);
    });

    if(rlpArray[datatypeIndex].length % 2) {
      rlpArray[datatypeIndex] = rlpArray[datatypeIndex] + '0';
    }

    rlpArray[datatypeIndex] = '0x' + rlpArray[datatypeIndex];
  }

  // console.log(rlpArray);
  return ethers.utils.RLP.encode(rlpArray);
}

export function decodeCertifyingAuthority(encodedAuthorityData) {
  const obj = {};
  const decoded = ethers.utils.RLP.decode(encodedAuthorityData);
  decoded.forEach((entry, i) => {
    if(i < authOrder.length) {
      obj[authOrder[i]] = ethers.utils.toUtf8String(entry);
    } else if(i > authOrder.length){
      const type = dataTypes[+('0x'+decoded[authOrder.length].slice(1+i-authOrder.length, 2+i-authOrder.length))];
      // console.log({value: entry[1], type});
      obj[bytesToString(entry[0])] = renderBytes(entry[1], type);
    }
  });
  return obj;
}

export function toTitleCase(str) {
  return str.split(' ').map(str1 => str1.slice(0,1).toUpperCase()+str1.slice(1)).join(' ');
}

export function toWebsiteURL(website) {
  if(website.slice(0,4) !== 'http') {
    website = 'http://' + website;
  }
  return website;
}
