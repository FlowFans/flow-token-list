const fs = require('fs');
const path = require('path');

const REGISTRY = 'token-registry';
const MAINNET_TOKEN_LIST_PATH = 'src/tokens/flow-mainnet.tokenlist.json';
const TESTNET_TOKEN_LIST_PATH = 'src/tokens/flow-testnet.tokenlist.json';

const tokenDirs = fs.readdirSync(REGISTRY);

const mainnetTokenList = generateTokenList(tokenDirs, 'mainnet');
if (mainnetTokenList) {
  mainnetTokenList.timestamp = new Date().toISOString();
  fs.writeFileSync(
    MAINNET_TOKEN_LIST_PATH,
    JSON.stringify(mainnetTokenList, null, 2)
  );
} else {
  console.log('[mainnet] no change');
}

const testnetTokenList = generateTokenList(tokenDirs, 'testnet');
if (testnetTokenList) {
  testnetTokenList.timestamp = new Date().toISOString();
  fs.writeFileSync(
    TESTNET_TOKEN_LIST_PATH,
    JSON.stringify(testnetTokenList, null, 2)
  );
} else {
  console.log('[testnet] no change');
}

function generateTokenList(tokenDirs, network) {
  let tokenFile = 'token.json';
  let baseListPath = MAINNET_TOKEN_LIST_PATH;
  if (network == 'testnet') {
    tokenFile = 'testnet.token.json';
    baseListPath = TESTNET_TOKEN_LIST_PATH;
  }
  let baseList = JSON.parse(fs.readFileSync(baseListPath));
  let originList = Object.assign({}, baseList);
  baseList.tokens = [];

  const newList = tokenDirs.sort().reduce((acc, file) => {
    const tokenPath = path.join(REGISTRY, file);
    if (fs.existsSync(tokenPath) && fs.lstatSync(tokenPath).isDirectory()) {
      const listPath = path.join(tokenPath, tokenFile);
      if (fs.existsSync(listPath)) {
        const token = JSON.parse(fs.readFileSync(listPath));
        acc.tokens.push(token);
      }
    }
    return acc;
  }, baseList);

  if (JSON.stringify(newList) == JSON.stringify(originList)) {
    return null;
  }
  return newList;
}
