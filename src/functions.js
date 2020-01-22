const ethers = require('ethers');

const parseCertificateObj = certificateObj => {
  const unsignedCertificate = ethers.utils.hexlify(ethers.utils.concat([certificateObj.name, certificateObj.qualification, certificateObj.extraData]));

  return parseCertificate(unsignedCertificate);
}

const parseCertificate = certificateString => {
  if(typeof certificateString === 'object') {
    return parseCertificateObj(certificateString);
  }

  if(certificateString.slice(0,2) === '0x') certificateString = certificateString.slice(2);
  if(certificateString.length < 96*2) throw new Error('Certificate length is too short');
  if((certificateString.length - 96*2) % 65*2 !== 0) throw new Error('Invalid certificate length');

  let rawCertificateDetails = '0x'+certificateString.slice(0,96*2);

  const parsedCertificate = {
    name: ethers.utils.toUtf8String('0x'+rawCertificateDetails.slice(0+2,64+2)),
    course: ethers.utils.toUtf8String('0x'+rawCertificateDetails.slice(64+2,124+2)),
    score: Number('0x'+rawCertificateDetails.slice(124+2,128+2))/100,
    extraData: '0x'+rawCertificateDetails.slice(128+2,192+2)
  }

  const digest = ethers.utils.hexlify(ethers.utils.concat([ethers.utils.toUtf8Bytes('\x19Ethereum Signed Message:\n96'),rawCertificateDetails]));
  const certificateHash = ethers.utils.keccak256(digest);

  let i = 0; const signatures = [];

  while(true) {
    const signature = certificateString.slice(96*2 + i*65*2, 96*2 + (i+1)*65*2);
    if(signature) {
      signatures.push({
        rawSignature: '0x'+signature,
        signer: ethers.utils.recoverAddress(certificateHash, '0x'+signature),
      });
    } else {
      break;
    }
    i++;
  }

  return {parsedCertificate, rawCertificateDetails, certificateHash, signatures};
}

function stringToBytes32(text) {
  // text = text.slice(0,32);
  if(text.length >= 32) throw new Error('only 32 chars allowed in bytes32');
  var result = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text));
  while (result.length < 66) { result += '0'; }
  if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
  return result;
}

function bytesToString(bytes) {
  return ethers.utils.toUtf8String(bytes).split('\u0000').join('');
}

function encodeQualification(courseName, percentile=0) {
  if(courseName.length >= 30) throw new Error('only 30 chars allowed as courseName');
  const courseNameHex = stringToBytes32(courseName).slice(0,62);

  // 2 byte percentile can display upto 2 decimal accuracy
  let percentileMul100Hex = ethers.utils.hexlify(Math.floor(percentile*100));
  while (percentileMul100Hex.length < 6) { percentileMul100Hex += '0'; }
  // console.log({courseNameHex,percentileMul100Hex});

  return ethers.utils.hexlify(ethers.utils.concat([courseNameHex, percentileMul100Hex]));
}

function decodeQualification(qualification) {
  if(qualification.slice(0,2) !== '0x') throw new Error('hex string should start with 0x');
  // qualification = qualification.slice(2);
  const courseName = bytesToString(qualification.slice(0,62));
  const percentile = (+('0x'+qualification.slice(62,66)))/100;
  return {courseName, percentile};
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

export { parseCertificate, stringToBytes32, bytesToString, encodeQualification, decodeQualification, parsePackedAddress };
