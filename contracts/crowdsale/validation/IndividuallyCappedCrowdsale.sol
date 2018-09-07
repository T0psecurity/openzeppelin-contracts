pragma solidity ^0.4.24;

import "../../math/SafeMath.sol";
import "../Crowdsale.sol";
import "../../access/roles/CapperRole.sol";


/**
 * @title IndividuallyCappedCrowdsale
 * @dev Crowdsale with per-beneficiary caps.
 */
contract IndividuallyCappedCrowdsale is Crowdsale, CapperRole {
  using SafeMath for uint256;

  mapping(address => uint256) private contributions_;
  mapping(address => uint256) private caps_;

  /**
   * @dev Sets a specific beneficiary's maximum contribution.
   * @param _beneficiary Address to be capped
   * @param _cap Wei limit for individual contribution
   */
  function setCap(address _beneficiary, uint256 _cap) external onlyCapper {
    caps_[_beneficiary] = _cap;
  }

  /**
   * @dev Returns the cap of a specific beneficiary.
   * @param _beneficiary Address whose cap is to be checked
   * @return Current cap for individual beneficiary
   */
  function getCap(address _beneficiary) public view returns (uint256) {
    return caps_[_beneficiary];
  }

  /**
   * @dev Returns the amount contributed so far by a specific beneficiary.
   * @param _beneficiary Address of contributor
   * @return Beneficiary contribution so far
   */
  function getContribution(address _beneficiary)
    public view returns (uint256)
  {
    return contributions_[_beneficiary];
  }

  /**
   * @dev Extend parent behavior requiring purchase to respect the beneficiary's funding cap.
   * @param _beneficiary Token purchaser
   * @param _weiAmount Amount of wei contributed
   */
  function _preValidatePurchase(
    address _beneficiary,
    uint256 _weiAmount
  )
    internal
  {
    super._preValidatePurchase(_beneficiary, _weiAmount);
    require(
      contributions_[_beneficiary].add(_weiAmount) <= caps_[_beneficiary]);
  }

  /**
   * @dev Extend parent behavior to update beneficiary contributions
   * @param _beneficiary Token purchaser
   * @param _weiAmount Amount of wei contributed
   */
  function _updatePurchasingState(
    address _beneficiary,
    uint256 _weiAmount
  )
    internal
  {
    super._updatePurchasingState(_beneficiary, _weiAmount);
    contributions_[_beneficiary] = contributions_[_beneficiary].add(
      _weiAmount);
  }

}
