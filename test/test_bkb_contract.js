const BeiKeBox = artifacts.require("BeiKeBox")
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract("BeiKeBox", (accounts) => {
    describe("Initialize Token Test", async () => {
        it("Initialize the token should emit the mintEvent", async () => {
            const instance = await BeiKeBox.new()
            let producer = accounts[1]
            let id = 0
            let amount = 32767
            let price = 6;
            
            const transaction_recipt = await instance.initializeToken(producer, amount, price)
            
            const mint_id = Number.parseInt(transaction_recipt.logs[2].args.id).toString()
            assert.equal(mint_id, id.toString(), "Incorrect ID")
        });
        it("Mulpitle initialize the token should emit the mintEvent with iterated ID", async () => {
            const instance = await BeiKeBox.new()
            let producer = accounts[1]
            let id = 0
            let next_id = id + 1
            let amount = 32767
            let price = 6;
            await instance.initializeToken(producer, amount, price)
            
            const transaction_recipt = await instance.initializeToken(producer, amount, price)
            
            const mint_id = Number.parseInt(transaction_recipt.logs[2].args.id).toString()
            assert.equal(mint_id, next_id.toString(), "Incorrect ID")
        });
    })
    describe("Mint Test", async () => {
        it("Mint token should have correct balance of token", async () => {
            const instance = await BeiKeBox.new()
            let producer = accounts[1]
            let id = 0
            let amount = 32767
            
            await instance.mint(producer, amount)

            const balance = (await instance.balanceOf(producer, id)).toString()
            assert.equal(balance, amount.toString(), "Incorrect amount of token")
        });
        
        it("Mint token should iterator the ID", async () => {
            const instance = await BeiKeBox.new()
            let producer = accounts[1]
            let id = 0
            let next_id = 1
            let amount = 32767
            
            await instance.mint(producer, amount)
            await instance.mint(producer, amount)

            const id_balance = (await instance.balanceOf(producer, id)).toString()
            const next_id_balance = (await instance.balanceOf(producer, next_id)).toString()
            assert.equal(id_balance, amount.toString(), "Incorrect amount of token")
            assert.equal(next_id_balance, amount.toString(), "Incorrect amount of token")
        });

        it("Mint token should return the ID", async () => {
            const instance = await BeiKeBox.new()
            let producer = accounts[1]
            let id = 0
            let amount = 32767
            
            const mint_id = Number.parseInt((await instance.mint(producer, amount)).logs[2].args.id).toString()

            assert.equal(mint_id, id.toString(), "Incorrect ID")
        });

        it("Mint multiple time should return the iterated ID", async () => {
            const instance = await BeiKeBox.new()
            let producer = accounts[1]
            let id = 0
            let next_id = 1
            let amount = 32767
            
            const mint_id = Number.parseInt((await instance.mint(producer, amount)).logs[2].args.id).toString()
            const next_mint_id = Number.parseInt((await instance.mint(producer, amount)).logs[2].args.id).toString()

            assert.equal(mint_id, id.toString(), "Incorrect ID")
            assert.equal(next_mint_id, next_id.toString(), "Incorrect ID")
        });

        it("Mint token with not owner should revert the operation", async () => {
            const instance = await BeiKeBox.new()
            let producer = accounts[1]
            let id = 0
            let amount = 32767
            
            await truffleAssert.fails(
                instance.mint(producer, amount, {from: accounts[1]}),
                truffleAssert.ErrorType.REVERT,
                "Operation is not premitted."
            )
        });

    });
    describe("SetPrice Test", async () => {
        it("Set price to the token should have correct price of token", async () => {
            const instance = await BeiKeBox.new()
            const producer = accounts[1]
            const id = 0
            const amount = 32767
            const excepted_price = 5
            await instance.mint(producer, amount)
            
            await instance.setPrice(id, excepted_price)

            const price = (await instance.getPrice(id)).toString()
            assert.equal(price, excepted_price.toString(), "Incorrect price")
        });
        it("Set price to the token with not owner should revert the operation", async () => {
            const instance = await BeiKeBox.new()
            const producer = accounts[1]
            const id = 0
            const amount = 32767
            const excepted_price = 5
            await instance.mint(producer, amount)
            
            await truffleAssert.fails(
                instance.setPrice(id, excepted_price, {from: accounts[1]}),
                truffleAssert.REVERT,
                "Operation is not premitted."
            )
        });
        it("Set price to the token with invalid ID should revert the operation", async () => {
            const instance = await BeiKeBox.new()
            const producer = accounts[1]
            const id = 0
            const amount = 32767
            const excepted_price = 5
            await instance.mint(producer, amount)
            
            await truffleAssert.fails(
                instance.setPrice(3, excepted_price),
                truffleAssert.REVERT,
                "Specific ID is not minted."
            )
        });
    });
    describe("GetPrice Test", async () => {
        it("Get price to the token with invalid ID should revert the operation", async () => {
            const instance = await BeiKeBox.new()
            const producer = accounts[1]
            const id = 0
            const amount = 32767
            const excepted_price = 5
            await instance.mint(producer, amount)
            
            await truffleAssert.fails(
                instance.getPrice(3),
                truffleAssert.REVERT,
                "Specific ID is not minted."
            )
        });
    });
    describe("Purchase Test", async () => {
        it("Purchase token with enough money should transfer the token", async () => {
            const instance = await BeiKeBox.new()
            const producer = accounts[1]
            const customer = accounts[2]
            const id = 0
            const amount = 32767
            const price = 5;
            await instance.mint(producer, amount)
            await instance.setPrice(id, price);
            
            await instance.purchase(id, {from: customer, value: 10})

            let customerBalance = (await instance.balanceOf(customer, id)).toNumber()
            let producerBalance = (await instance.balanceOf(producer, id)).toNumber()
            assert.equal(customerBalance, 1, "Not transfer. [customer]")
            assert.equal(producerBalance, amount-1, "Not transfer token. [producer]")
        });
        it("Purchase token with enough money should transfer the token", async () => {
            const instance = await BeiKeBox.new()
            const producer = accounts[1]
            const customer = accounts[2]
            const id = 0
            const amount = 32767
            const price = 5;
            let producerBalance = web3.utils.toBN(await web3.eth.getBalance(producer))
            await instance.mint(producer, amount)
            await instance.setPrice(id, price);
            
            await instance.purchase(id, {from: customer, value: 10})


            const newBalance = web3.utils.toBN(await web3.eth.getBalance(producer));
            let exceptedProducerBalance = producerBalance.add(web3.utils.toBN(price))
            assert.equal(newBalance.toString(), exceptedProducerBalance.toString(), "Not transfer money. [producer]")
        });
        it("Purchase token with not enough money should revert the operation", async () => {
            const instance = await BeiKeBox.new()
            const producer = accounts[1]
            const customer = accounts[2]
            const id = 0
            const amount = 32767
            const price = 5;
            await instance.mint(producer, amount)
            await instance.setPrice(id, price);
            
            await truffleAssert.fails(
                instance.purchase(id, {from: customer, value: 2}),
                truffleAssert.REVERT,
                "revert"
            );
        });
    });
})