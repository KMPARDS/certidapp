const ethers = require('ethers');

const parseCertificate = certificateString => {
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

  let i = 0; const signatures = [];

  while(true) {
    const signature = certificateString.slice(96*2 + i*65*2, 96*2 + (i+1)*65*2);
    if(signature) {
      signatures.push({
        rawSignature: '0x'+signature,
        signer: ethers.utils.recoverAddress(rawCertificateDetails, '0x'+signature),
      });
    } else {
      break;
    }
    i++;
  }

  return {parsedCertificate, rawCertificateDetails, signatures};
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

export { parseCertificate, stringToBytes32, bytesToString };
