// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VowNFT} from "../src/VowNFT.sol";
import {IWorldID, HumanBond} from "../src/HumanBond.sol";
import {MilestoneNFT} from "../src/MilestoneNFT.sol";
import {TimeToken} from "../src/TimeToken.sol";

/// @notice Dummy World ID verifier for local testing. Replace with the real one on testnet.
contract DummyWorldID is IWorldID {
    function verifyProof(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256[8] calldata
    ) external pure override {}
}

/// @title Deploy Script for HumanBond Protocol
/// @notice Deploys VowNFT and HumanBond, sets up linkage, and prints addresses.
contract DeployScript is Script {
    function run() external {
        // Load private key from .env file
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy contract and token
        VowNFT vowNFT = new VowNFT();
        MilestoneNFT milestoneNFT = new MilestoneNFT();
        TimeToken timeToken = new TimeToken();
        DummyWorldID worldId = new DummyWorldID(); //(replace with real one later)

        // Step 2: Set milestone metadata URIs BEFORE ownership transfer
        milestoneNFT.setMilestoneURI(
            1,
            "ipfs://QmPAVmWBuJnNgrGrAp34CqTa13VfKkEZkZak8d6E4MJio8"
        );
        milestoneNFT.setMilestoneURI(
            2,
            "ipfs://QmPTuKXg64EaeyreUFe4PJ1istspMd4G2oe2ArRYrtBGYn"
        );
        milestoneNFT.setMilestoneURI(
            3,
            "ipfs://Qma32oBrwNNQVR3KS14RHqt3QhgYMsGKabQv4jusdtgsKN"
        );
        milestoneNFT.setMilestoneURI(
            4,
            "ipfs://QmSw9ixqCVc7VPQzDdX1ZCdWWJwAfLHRdJsi831PsC94uh"
        );

        // Step 3: Deploy HumanBond main contract
        uint256 externalNullifier = 12345; // replace if needed
        HumanBond humanBond = new HumanBond(
            address(worldId),
            address(vowNFT),
            address(timeToken),
            address(milestoneNFT),
            externalNullifier
        );

        milestoneNFT.setHumanBondContract(address(humanBond)); //Link MilestoneNFT to HumanBond
        vowNFT.setHumanBondContract(address(humanBond));

        // Step 4: Set contracts authorization
        vowNFT.transferOwnership(address(humanBond));
        timeToken.transferOwnership(address(humanBond));
        milestoneNFT.transferOwnership(address(humanBond));

        vm.stopBroadcast();

        // Logs
        console.log("Deployment complete!");
        console.log("VowNFT deployed at:", address(vowNFT));
        console.log("MilestoneNFT deployed at:", address(milestoneNFT));
        console.log("HumanBond deployed at:", address(humanBond));
        console.log("DummyWorldID deployed at:", address(worldId));
    }
}
