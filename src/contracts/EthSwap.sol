pragma solidity ^0.5.0;

import './Token.sol';

contract EthSwap {
  string public name = "QLAY instant Exchange";
  //variable pour représenter le contrat Token
  Token public token;
  uint public rate = 100;

  event TokenPurchased(
    address account,
    address token,
    uint amount,
    uint rate);

  event TokenSold(
    address account,
    address token,
    uint amount,
    uint rate);

  constructor(Token _token) public {
    token = _token;
  }

  function buyTokens() public payable {
    // redemption rate = # of tokens they receive for 1 Ether
    rate;
    // Amount of Ethereum * redemption rate
    // Calculate the number of token to buy
    uint tokenAmount = msg.value * rate;

    //require buyer has enough token
    require(token.balanceOf(address(this)) >= tokenAmount);

    //transfer token to the user
    token.transfer(msg.sender, tokenAmount);

    //Emit an event purchase token
    emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
  }



    // Transfer token form the investor to ethSwap and give him Ether
  function sellTokens(uint _amount) public {
    // User can't sell more tokens than they have
    require(token.balanceOf(msg.sender)>=_amount);

    // calculate the amount of Ether to redeem
    uint etherAmount = _amount / rate;

    // Require EthSwap has enough Ether
    require(address(this).balance >= etherAmount);

    // Perform sale (transfer form Ether and not form token)
    token.transferFrom(msg.sender, address(this), _amount);
    msg.sender.transfer(etherAmount);

    //Emit the event
    emit TokenSold(msg.sender, address(token), _amount, rate);
  }
}

