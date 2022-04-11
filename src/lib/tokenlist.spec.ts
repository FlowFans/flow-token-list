import fs from 'fs';

import test from 'ava';

import { ENV, Strategy, TokenInfo, TokenListProvider } from './tokenlist';

test('Token list is filterable by a tag', async (t) => {
  const list = (
    await new TokenListProvider().resolve(Strategy.Static, ENV.Mainnet)
  )
    .filterByTag('nft')
    .getList();

  t.false(list.some((item) => item.symbol === 'SOL'));
});

test('Token list can exclude by a tag', async (t) => {
  const list = (
    await new TokenListProvider().resolve(Strategy.Static, ENV.Mainnet)
  )
    .excludeByTag('nft')
    .getList();

  t.false(list.some((item) => item.tags === ['nft']));
});

test('Token list is a valid json', async (t) => {
  t.notThrows(() => {
    const content = fs
      .readFileSync('./src/tokens/flow-mainnet.tokenlist.json')
      .toString();
    JSON.parse(content.toString());
  });
});

test('Token list does not have duplicate entries', async (t) => {
  const list = await new TokenListProvider().resolve(
    Strategy.Static,
    ENV.Mainnet
  );
  list.getList().reduce((agg, item) => {
    const key = `${item.address}${item.contractName}`;
    if (agg.has(key)) {
      console.log(key);
    }

    t.false(agg.has(key));
    agg.set(key, item);
    return agg;
  }, new Map<string, TokenInfo>());
});
