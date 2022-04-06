# Flow Native Token List

The community maintained Flow native token registry.

Following the JSON schema of <https://github.com/Uniswap/token-lists>

## Contents

todo

## Semantic versioning

Lists include a version field, which follows semantic versioning.

List versions must follow the rules:

Increment major version when tokens are removed
Increment minor version when tokens are added
Increment patch version when tokens already on the list have minor details changed (name, symbol, logo URL, decimals)
Changing a token address or chain ID is considered both a remove and an add, and should be a major version update.

Note that list versioning is used to improve the user experience, but not for security, i.e. list versions are not meant to provide protection against malicious updates to a token list; i.e. the list semver is used as a lossy compression of the diff of list updates. List updates may still be diffed in the client dApp.
