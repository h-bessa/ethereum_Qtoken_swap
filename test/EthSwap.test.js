const EthSwap = artifacts.require("EthSwap")
const Token = artifacts.require("Token")

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('Ethswap', ([deployer, investor]) => {
  let token, ethSwap

  before(async () => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)
    // Transfer all tokens to ethSwap  (1 million)
    await token.transfer(ethSwap.address, tokens('1000000'))
  })

  describe('Token deployement', async () => {
    it('contract has a name', async () => {
      const name = await token.name()
      assert.equal(name, "QLAY Token")
    })
  })

  describe('EthSwap deployement', async () => {

    it('contract has a name', async () => {
      const name = await ethSwap.name()
      assert.equal(name, "QLAY instant Exchange")
    })

    it('contract has tokens', async () => {
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('Buytokens function', async () => {
    let result

    before(async () => {
      // Purchase tokens before each exemple
      result = await ethSwap.buyTokens({from: investor, value: web3.utils.toWei('1', 'ether')})
    })

    it('Allow user to purchase tokens from Ethswap for a fixed price', async () => {
      // Check investor balance
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('100'))
      
      // Check ethSwap balance after purchase
      let ethSwapBalance
      ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('999900'))

      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether'))

      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

    })
  })

  describe('SellToken function', async () => {
    let result

    before(async () => {
      // Investor must approve tokens before the purchase
      await token.approve(ethSwap.address, tokens('100'), { from: investor })
      // Investor sells tokens
      result = await ethSwap.sellTokens(tokens('100'), { from: investor })
    })

    it('Allow user to sell tokens to Ethswap contract for a fixed price', async () => {
      // Check investor Balance
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('0'))

      // Check Ethswap Balance
      let ethSwapBalance
      ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('1000000'))
      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'ether'))

      //Checks logs
      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

      // FAILURE : Investors Can't sell more than they have
      await ethSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected

    })
  })
  
})