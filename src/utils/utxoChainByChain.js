
const bitcoinSeriesMap = {
  'Bitcoin': 'btc',
  'Litecoin': 'ltc',
  'BitcoinCash': 'bch',
  'Dogecoin': 'doge',
  'BitcoinSv': 'bsv'
}
/**
 * 获取 UTXO 链的简写
 * @params chain
 * @returns utxoChain
 */
function getUtxoChainByChain(chain) {
  return bitcoinSeriesMap[chain] || chain;
}

export {
  getUtxoChainByChain
} 