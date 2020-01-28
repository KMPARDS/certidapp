import { dataTypes, order } from './env';

const ethers = require('ethers');

function bytesToString(bytes) {
  return ethers.utils.toUtf8String(bytes).split('\u0000').join('');
}

function parsePackedAddress(packedAddresses) {
  if(packedAddresses.slice(0,2).toLowerCase() === '0x') packedAddresses = packedAddresses.slice(2);
  if(packedAddresses.length%40 !== 0) throw new Error('Invalid packed addresses');
  const addressArray = [];
  for(let i = 0; i < packedAddresses.length/40; i++) {
    addressArray.push('0x'+packedAddresses.slice(0+40*i,40+40*i));
  }
  return addressArray;
}



function getDataTypeHexByte(type) {
  const index = dataTypes.indexOf(type);
  if(index === -1) throw new Error('Invalid certificate data type: ' + type);
  return index.toString(16);
}

function guessDataTypeFromInput(input) {
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
function bytify(input, type) {
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

function renderBytes(hex, type) {
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

function isProperValue(input) {
  return ![undefined, null, NaN].includes(input);
}

function getCertificateHashFromDataRLP(certificateDataRLP) {
  const digest = ethers.utils.hexlify(ethers.utils.concat([ethers.utils.toUtf8Bytes('\x19Ethereum Signed Message:\n'+(certificateDataRLP.length/2 - 1)),certificateDataRLP]));
  return ethers.utils.keccak256(digest);
}

function encodeCertificateObject(obj, signature = []) {
  let signatureArray = typeof signature === 'object' ? signature : [signature];
  const entries = Object.entries(obj);
  const certRLPArray = [];

  // adding name and subject into rlpArray
  order.forEach(property => {
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

  const extraData = entries.filter(property => !order.includes(property[0]) && isProperValue(property[1]));

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

  console.log(certRLPArray);
  const dataRLP = ethers.utils.RLP.encode(certRLPArray);
  return {
    fullRLP: ethers.utils.RLP.encode([certRLPArray, ...signatureArray]),
    dataRLP,
    certificateHash: getCertificateHashFromDataRLP(dataRLP)
  };
}

function addSignaturesToCertificateRLP(encodedFullCertificate, signature = []) {
  let signatureArray = typeof signature === 'object' ? signature : [signature];
  let certificateData;
  if(typeof encodedFullCertificate === 'object') {
    certificateData = ethers.utils.RLP.decode(encodedFullCertificate.dataRLP);
  } else {
    const decoded = ethers.utils.RLP.decode(encodedFullCertificate.fullRLP);
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

function decodeCertificateData(encodedCertificate) {
  let fullRLP = typeof encodedCertificate === 'object' ? encodedCertificate.fullRLP : encodedCertificate;
  const decoded = ethers.utils.RLP.decode(fullRLP);
  const obj = {};

  let decodedCertificatePart, signatureArray;
  //checking if decoded is of fullRLP or certificate data part
  if(typeof decoded[0] === 'string') {
    decodedCertificatePart = decoded;
  } else {
    decodedCertificatePart = decoded[0];
    signatureArray = decoded.slice(1);
  }

  decodedCertificatePart.forEach((entry, i) => {
    if(i < order.length) {
      if(order[i] !== 'score') {
        obj[order[i]] = ethers.utils.toUtf8String(entry);
      } else {
        obj[order[i]] = renderBytes(entry, 'float');
      }
    } else if(i > order.length){
      const type = dataTypes[+('0x'+decodedCertificatePart[order.length].slice(1+i-order.length, 2+i-order.length))];
      // console.log({value: entry[1], type});
      obj[bytesToString(entry[0])] = renderBytes(entry[1], type);
    }
  });

  if(signatureArray) {
    let key = '_signatures';
    while(obj[key]) key = '_' + key;
    obj[key] = signatureArray;
  }

  return obj;
}
