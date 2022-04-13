import { fetch } from 'cross-fetch';

import tokenlistMainnet from './../tokens/flow-mainnet.tokenlist.json';
import tokenlistTestnet from './../tokens/flow-testnet.tokenlist.json';

export enum ENV {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export interface TokenList {
  readonly name: string;
  readonly logoURI: string;
  readonly tags: { [tag: string]: TagDetails };
  readonly timestamp: string;
  readonly tokens: TokenInfo[];
}

export interface TagDetails {
  readonly name: string;
  readonly description: string;
}

export interface PathDetail {
  readonly vault: string;
  readonly receiver: string;
  readonly balance: string;
}

export interface TokenExtensions {
  readonly website?: string;
  readonly bridgeContract?: string;
  readonly assetContract?: string;
  readonly address?: string;
  readonly explorer?: string;
  readonly twitter?: string;
  readonly github?: string;
  readonly medium?: string;
  readonly tgann?: string;
  readonly tggroup?: string;
  readonly discord?: string;
  readonly coingeckoId?: string;
  readonly imageUrl?: string;
  readonly description?: string;
}

export interface TokenInfo {
  readonly address: string;
  readonly name: string;
  readonly contractName: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly path: PathDetail;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: TokenExtensions;
}

export type TokenInfoMap = Map<string, TokenInfo>;

export const CLUSTER_SLUGS: { [id: string]: ENV } = {
  mainnet: ENV.Mainnet,
  testnet: ENV.Testnet,
};

export class GitHubTokenListResolutionStrategy {
  repositories = {
    [ENV.Mainnet]: [
      'https://raw.githubusercontent.com/FlowFans/flow-token-list/main/src/tokens/flow-mainnet.tokenlist.json',
    ],
    [ENV.Testnet]: [
      'https://raw.githubusercontent.com/FlowFans/flow-token-list/main/src/tokens/flow-testnet.tokenlist.json',
    ],
  };

  resolve = (network: ENV = ENV.Mainnet) => {
    return queryJsonFiles(this.repositories[network]);
  };
}

export class CDNTokenListResolutionStrategy {
  repositories = {
    [ENV.Mainnet]: [
      'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/src/tokens/flow-mainnet.tokenlist.json',
    ],
    [ENV.Testnet]: [
      'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/src/tokens/flow-testnet.tokenlist.json',
    ],
  };
  resolve = (network: ENV = ENV.Mainnet) => {
    return queryJsonFiles(this.repositories[network]);
  };
}

const queryJsonFiles = async (files: string[], network: ENV = ENV.Mainnet) => {
  const responses: TokenList[] = (await Promise.all(
    files.map(async (repo) => {
      try {
        const response = await fetch(repo);
        const json = (await response.json()) as TokenList;
        return json;
      } catch {
        console.info(
          `@flowfans/flow-native-token-registry: falling back to static repository.`
        );

        return network === ENV.Mainnet ? tokenlistMainnet : tokenlistTestnet;
      }
    })
  )) as TokenList[];

  return responses
    .map((tokenlist: TokenList) => tokenlist.tokens)
    .reduce((acc, arr) => (acc as TokenInfo[]).concat(arr), []);
};

export enum Strategy {
  GitHub = 'GitHub',
  Static = 'Static',
  CDN = 'CDN',
}

export class StaticTokenListResolutionStrategy {
  resolve = (network: ENV = ENV.Mainnet) => {
    if (network === ENV.Mainnet) return tokenlistMainnet.tokens;
    return tokenlistTestnet.tokens;
  };
}

export class TokenListProvider {
  static strategies = {
    [Strategy.GitHub]: new GitHubTokenListResolutionStrategy(),
    [Strategy.Static]: new StaticTokenListResolutionStrategy(),
    [Strategy.CDN]: new CDNTokenListResolutionStrategy(),
  };

  resolve = async (
    strategy: Strategy = Strategy.CDN,
    network: ENV = ENV.Mainnet
  ): Promise<TokenListContainer> => {
    return new TokenListContainer(
      await TokenListProvider.strategies[strategy].resolve(network)
    );
  };
}

export class TokenListContainer {
  constructor(private tokenList: TokenInfo[]) {}

  filterByTag = (tag: string) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => (item.tags || []).includes(tag))
    );
  };

  excludeByTag = (tag: string) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => !(item.tags || []).includes(tag))
    );
  };

  getList = () => {
    return this.tokenList;
  };
}
