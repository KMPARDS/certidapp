const ethers = require('ethers');
const { certificateContract, network } = require('./env');

window.ethereum.enable().then(() => {
  console.log(window.web3.currentProvider);

  window.networkId = window.web3.currentProvider.networkVersion;
  // === (network === 'homestead' ? '1' : '42');

  const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();

  window.certificateContractInstance = new ethers.Contract(
    certificateContract.address,
    certificateContract.abi,
    signer
  );

  // window.userAddress = signer;//.then(address => window.userAddress = address);
});


// export { networkId, certificateContractInstance };
