const ethers = require('ethers');
const { certificateContract } = require('./env');

const setGlobalVariables = () => {
  // console.log(window.web3.currentProvider);

  window.networkId = window.web3.currentProvider.networkVersion;
  // === (network === 'homestead' ? '1' : '42');

  window.signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();

  window.certificateContractInstance = new ethers.Contract(
    certificateContract.address,
    certificateContract.abi,
    window.signer
  );

  window.signer.getAddress().then(address => window.userAddress = address);

  // window.userAddress = signer;//.then(address => window.userAddress = address);
}

window.ethereum.enable().then(setGlobalVariables);

setInterval(() => {
  if(window.web3.currentProvider.selectedAddress.toLowerCase() !== window.userAddress.toLowerCase()) {
    setGlobalVariables();
  }
},1000);


// export { networkId, certificateContractInstance };
