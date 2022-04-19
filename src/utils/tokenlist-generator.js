const fs = require('fs');
const path = require('path');

const REGISTRY = 'token-registry';
const TEMPLATE_TOKEN_LIST_PATH = 'token-registry/template.tokenlist.json';
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
  let templateListPath = TEMPLATE_TOKEN_LIST_PATH;
  let originListPath = MAINNET_TOKEN_LIST_PATH;
  if (network == 'testnet') {
    tokenFile = 'testnet.token.json';
    originListPath = TESTNET_TOKEN_LIST_PATH;
  }
  let baseList = JSON.parse(fs.readFileSync(templateListPath));
  let originList = JSON.parse(fs.readFileSync(originListPath));
  baseList.tokens = [];
  baseList.version = originList.version;

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
    // No change
    return null;
  }

  const newTokens = newList.tokens.map((token) => {
    return `${token.address}-${token.contractName}`;
  });
  const origTokens = originList.tokens.map((token) => {
    return `${token.address}-${token.contractName}`;
  });
  const newTokensSet = new Set(newTokens);
  const origTokensSet = new Set(origTokens);

  const newTokenAdded = difference(newTokensSet, origTokensSet).size > 0;
  const oldTokenDeleted = difference(origTokensSet, newTokensSet).size > 0;

  if (oldTokenDeleted) {
    newList.version.major = originList.version.major + 1;
    newList.version.minor = 0;
    newList.version.patch = 0;
  } else if (newTokenAdded) {
    newList.version.minor = originList.version.minor + 1;
    newList.version.patch = 0;
  } else {
    newList.version.patch = originList.version.patch + 1;
  }

  return newList;
}

function difference(setA, setB) {
  let _difference = new Set(setA);
  for (let elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}
