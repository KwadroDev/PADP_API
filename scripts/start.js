var MAX_SUPPLY = null
const CONTRACT_ADDRESS = "0xfac5775552fC18B50B405872A78fD31b9e7735E9"
const PORT = 80
const IS_REVEALED = false
const UNREVEALED_METADATA = {
    "name": "Unrevealed Little Horse",
    "description": "???",
    "image": "http://104.248.239.189:80/unrevealed/image.gif",
    "attributes": [{ "???": "???" }]
}

const fs = require('fs')
const express = require('express')
const Web3 = require('web3')
require('dotenv').config()
const abi = require('../Contract.json').abi
const Contract = require('web3-eth-contract')
Contract.setProvider(process.env.MUMBAI_RPC_URL)
const contract = new Contract(abi, CONTRACT_ADDRESS)

const app = express()

app.use(express.static(__dirname + 'public'))
app.use('/unrevealed', express.static(__dirname + '/unrevealed'));

async function initAPI() {
    MAX_SUPPLY = parseInt(await contract.methods.MAX_SUPPLY().call())
    console.log("MAX_SUPPLY is: " + MAX_SUPPLY)
    app.listen(PORT, () => {
        console.log(`Listening to port ${PORT}`)
    })
}
async function serveMetadata(res, nft_id) {
    var token_count = parseInt(await contract.methods.totalSupply().call())
    let return_value = {}
    if (nft_id < 0) {
        return_value = { error: "NFT ID must be greater than 0" }
    } else if (nft_id >= MAX_SUPPLY) {
        return_value = { error: "NFT ID must be lesser than max supply" }
    } else if (nft_id >= token_count) {
        return_value = { error: "NFT ID must be already minted" }
    } else {
        return_value = fs.readFileSync("./metadata/" + nft_id).toString().trim()
    }
    res.send(return_value)
}

app.get('/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (isNaN(req.params.id)) //in not number
    {
        res.send(UNREVEALED_METADATA)
    } else if (!IS_REVEALED) {
        res.send()
    } else {
        serveMetadata(res, req.params.id)
    }
})

initAPI()