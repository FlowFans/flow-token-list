# Flow Native Token List

The community maintained Flow native token registry.

Following the Uniswap Token List specification found here: <https://github.com/Uniswap/token-lists>

## How to fetch Flow native token list

Mainnet:

- From github: <https://raw.githubusercontent.com/FlowFans/flow-token-list/main/src/tokens/flow-mainnet.tokenlist.json>
- From jsdelivr CDN: <https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/src/tokens/flow-mainnet.tokenlist.json>

Testnet:

- From github: <https://raw.githubusercontent.com/FlowFans/flow-token-list/main/src/tokens/flow-testnet.tokenlist.json>
- From jsdelivr CDN: <https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/src/tokens/flow-testnet.tokenlist.json>

## Using NPM package

### Installation

```bash
npm install flow-native-token-registry
```

```bash
yarn add flow-native-token-registry
```

### Examples

#### Query available tokens

```typescript
import { TokenListProvider } from 'flow-native-token-registry';

new TokenListProvider().resolve().then((tokens) => {
  const tokenList = tokens.filterByTag('nft').getList();
  console.log(tokenList);
});
```

#### Render icon for token in React

```typescript jsx
import React, { useEffect, useState } from 'react';
import { TokenListProvider, TokenInfo } from 'flow-native-token-registry';


export const Icon = () => {
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  useEffect(() => {
    new TokenListProvider().resolve().then(tokens => {
      const tokenList = tokens.getList();

      setTokenMap(tokenList.reduce((map, item) => {
        map.set(`${item.symbol}`, item);
        return map;
      }, new Map()));
    });
  }, [setTokenMap]);

  const token = tokenMap.get('FLOW');
  if (!token || !token.logoURI) return null;

  return (<img src={token.logoURI} />);

```

## Adding new token

To submit a new token:

- Make sure the title of your pull request starts with `feat(NewToken):`
- Modifications are only allowed within the `token-registry` folder
- Make sure the directory name of your token is in this format: `A.{tokenMainnetAddress}.{tokenContractName}`
- Make sure your token name is not the same as an exsiting one
- You can only add one token each time
- You can only add the files below:

```
logo.png (required)
token.json (required)
logo-large.png
logo.svg
testnet.token.json
```

- PNG files in your pull request should be smaller than 20KB
- JSON files in your pull request should conform to the [schema](https://github.com/FlowFans/flow-token-list/blob/596f711e1798e358e118a0f223254b75088bd652/src/schemas/token.schema.json)
  - `logoURI`
    - Should be submitted to this repo, so that `logoURI` should point to
      - jsdelivr CDN: <https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/token-registry/${YOUR_DIRECTORY_NAME}/${YOUR_LOGO}> or
      - github: <https://raw.githubusercontent.com/FlowFans/flow-token-list/main/token-registry/${YOUR_DIRECTORY_NAME}/${YOUR_LOGO}>
  - `tags`
    - Valid tags are defined [here](https://github.com/FlowFans/flow-token-list/blob/596f711e1798e358e118a0f223254b75088bd652/token-registry/template.tokenlist.json#L5), don't use any other tag
  - `extensions`
    - the `extensions` block can contain links to your twitter, discord, etc. A list of allowed extensions is [here](https://github.com/FlowFans/flow-token-list/blob/596f711e1798e358e118a0f223254b75088bd652/src/lib/tokenlist.ts#L30)
    - `coingeckoId` is the string that appears as 'API id' on the corresponding coingecko page
- Make sure your JSON files are formatted by using prettier(it should be done automatically if you have installed dependencies of this project)
- Please squash commits into a single commit for cleanliness

## Modifying existing token

To modify an existing token:

- Make sure the title of your pull request starts with `feat(UpdateToken):`
- Modifications are only allowed within the `token-registry` folder
- You can only modify one token each time
- You can only modify the files below:

```
logo.png
token.json
logo-large.png
logo.svg
testnet.token.json
```

- PNG files in your pull request should be smaller than 20KB
- JSON files in your pull request should conform to the [schema](https://github.com/FlowFans/flow-token-list/blob/596f711e1798e358e118a0f223254b75088bd652/src/schemas/token.schema.json)
- Make sure your JSON files are formatted by using prettier(it should be done automatically if you have installed dependencies of this project)
- Please check the 'Files changed' tab on your PR to ensure that your change is as expected
- Please link the commit or PR where the token was originally added. If the token was added by someone else, they will be asked to confirm that this change is authorized
- Please squash commits into a single commit for cleanliness

## Semantic versioning

Lists include a version field, which follows semantic versioning.

List versions must follow the rules:

- Increment major version when tokens are removed
- Increment minor version when tokens are added
- Increment patch version when tokens already on the list have minor details changed (name, symbol, logo URL, decimals)

Changing a token address or chain ID is considered both a remove and an add, and should be a major version update.

Note that list versioning is used to improve the user experience, but not for security, i.e. list versions are not meant to provide protection against malicious updates to a token list; i.e. the list semver is used as a lossy compression of the diff of list updates. List updates may still be diffed in the client dApp.
