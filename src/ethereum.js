const ethers = require('ethers');
const { certificateContract, network } = require('./env');

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

const setUpMetamask = () => {
  try {
    window.ethereum.enable().then(setGlobalVariables);

    setInterval(() => {
      if(window.web3 && window.web3.currentProvider && window.web3.currentProvider.selectedAddress && window.userAddress && window.web3.currentProvider.selectedAddress.toLowerCase() !== window.userAddress.toLowerCase()) {
        setGlobalVariables();
      }
    },100);

    return true;
  } catch (error) {
    return false;
  }
};

if(window.ethereum) {
  setUpMetamask();
} else {
  window.certificateContractInstance = new ethers.Contract(
    certificateContract.address,
    certificateContract.abi,
    ethers.getDefaultProvider(network)
  );

  const intervalId = setInterval(() => {
    if(setUpMetamask()) {
      console.log('Metamask setup done!');
      clearInterval(intervalId);
    }
  }, 100);
}


// export { networkId, certificateContractInstance };
