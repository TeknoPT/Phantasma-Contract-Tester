# Phantasma-Contract-Tester
Phantasma Contract Tester.

## How to use it. 

Note: Before doing anything, you must choose whether to use your API, Localnet (Spook Running on your machine) the official Phantasma Testnet or the Phantasma Mainnet.

* Select the desired ```API```.
* Select the ```Contract``` that you want to test.
* Connect to the contract by signing in using ```Poltergeist``` or ```Ecto```.
* If you receive the status ```Not Connected``` after signing in using your wallet, an error must occured - if so, please reload the page and try again.
* Select the desired method to test, and fill in the required parameters.
* Make an ```InvokeScript``` or ```SendTransaction``` call to test vaious aspects of you contract.

<br />

### <b>Tips</b>
* ```InvokeScript or InvokeRawScript``` are used to call the chain without changing it - it fetches values from the chain without changing its state.
* ```SendTransaction``` is used to make calls to the chain resulting in a changed state.

### <b>License</b>

[MIT](https://github.com/TeknoPT/Phantasma-Contract-Tester/blob/main/LICENSE) © João <Tek> Novo ([@TeknoPT](https://github.com/TeknoPT))

<br />