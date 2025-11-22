// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {HumanBond, IWorldID} from "../src/HumanBond.sol";
import {VowNFT} from "../src/VowNFT.sol";
import {MilestoneNFT} from "../src/MilestoneNFT.sol";
import {TimeToken} from "../src/TimeToken.sol";
import {MarriageIdHelper} from "./utils/MarriageHelper.sol";

// Dummy verifier (same used in deploy)
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

contract AutomationFlowTest is Test {
    VowNFT vowNFT;
    MilestoneNFT milestoneNFT;
    TimeToken timeToken;
    DummyWorldID worldId;
    HumanBond humanBond;

    address alice = address(0xA1);
    address bob = address(0xB1);

    function setUp() public {
        // Deploy base components
        worldId = new DummyWorldID();
        vowNFT = new VowNFT();
        milestoneNFT = new MilestoneNFT();
        timeToken = new TimeToken();

        // Set milestone URIs (required or mint will revert)
        milestoneNFT.setMilestoneURI(
            1,
            "ipfs://QmPAVmWBuJnNgrGrAp34CqTa13VfKkEZkZak8d6E4MJio8"
        );
        milestoneNFT.setMilestoneURI(
            2,
            "ipfs://QmPTuKXg64EaeyreUFe4PJ1istspMd4G2oe2ArRYrtBGYn"
        );

        // Deploy HumanBond
        humanBond = new HumanBond(
            address(worldId),
            address(vowNFT),
            address(timeToken),
            address(milestoneNFT),
            12345
        );

        // Link contracts
        milestoneNFT.setHumanBondContract(address(humanBond));
        vowNFT.setHumanBondContract(address(humanBond));

        // Transfer ownership so HumanBond can mint
        milestoneNFT.transferOwnership(address(humanBond));
        timeToken.transferOwnership(address(humanBond));
        vowNFT.transferOwnership(address(humanBond));

        // Give ETH so things don't revert
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    // function test__CannotProposeToSelf() public {
    //     vm.startPrank(alice);
    //     vm.expectRevert();
    //     humanBond.propose(alice, 1, 1111, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
    //     vm.stopPrank();
    // }

    function test__proposal_CannotProposeTwice() public {
        vm.startPrank(alice);

        humanBond.propose(bob, 1, 1111, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);

        vm.expectRevert(); // expecting double proposal revert
        humanBond.propose(
            address(0xB5),
            1,
            1111,
            [uint256(0), 0, 0, 0, 0, 0, 0, 0]
        );

        vm.stopPrank();
    }

    function test__OnlyProposedPartnerCanAccept() public {
        vm.startPrank(alice);
        humanBond.propose(bob, 1, 1111, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        address intruder = address(0xDEAD);

        vm.startPrank(intruder);
        vm.expectRevert();
        humanBond.accept(alice, 1, 2222, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();
    }

    function test__MarriageIdSymmetry() public {
        // Deploy helper
        MarriageIdHelper helper = new MarriageIdHelper();

        bytes32 id1 = helper.exposed_getMarriageId(alice, bob);
        bytes32 id2 = helper.exposed_getMarriageId(bob, alice);

        assertEq(id1, id2, "Marriage IDs should be symmetric");
    }

    function test__VowNFTMintedOnAccept() public {
        vm.startPrank(alice);
        humanBond.propose(bob, 1, 1111, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        vm.startPrank(bob);
        humanBond.accept(alice, 1, 2222, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        assertEq(vowNFT.ownerOf(1), alice);
        assertEq(vowNFT.ownerOf(2), bob);
    }

    function test__InitialTimeTokenMintOnAccept() public {
        vm.startPrank(alice);
        humanBond.propose(bob, 1, 1111, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        vm.startPrank(bob);
        humanBond.accept(alice, 1, 2222, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        assertEq(timeToken.balanceOf(alice), 1 ether);
        assertEq(timeToken.balanceOf(bob), 1 ether);
    }

    function test__TimeWithdrawalSplitEvenly() public {
        // marry
        vm.startPrank(alice);
        humanBond.propose(bob, 1, 1111, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        vm.startPrank(bob);
        humanBond.accept(alice, 1, 2222, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        // warp 100 days (100 TIME)
        vm.warp(block.timestamp + 100 days);

        // withdraw yield — but the correct method is claimYield(partner)
        vm.startPrank(alice);
        humanBond.claimYield(bob);
        vm.stopPrank();

        // both should get 50 tokens each
        assertEq(timeToken.balanceOf(alice), 51 ether);
        assertEq(timeToken.balanceOf(bob), 51 ether);
    }

    function test__ClaimYieldResetsCounter() public {
        // marry
        vm.startPrank(alice);
        humanBond.propose(bob, 1, 1111, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        vm.startPrank(bob);
        humanBond.accept(alice, 1, 2222, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        // warp 1 day
        vm.warp(block.timestamp + 1 days);

        // Correct ordering: caller is alice, partner is bob
        vm.startPrank(alice);
        humanBond.claimYield(bob);
        vm.stopPrank();

        // both receive 0.5 DAY token + 1 initial mint
        assertEq(timeToken.balanceOf(alice), 1 ether + 0.5 ether);
        assertEq(timeToken.balanceOf(bob), 1 ether + 0.5 ether);

        // warp another day
        vm.warp(block.timestamp + 1 days);

        // claim again
        vm.startPrank(bob);
        humanBond.claimYield(alice);
        vm.stopPrank();

        assertEq(timeToken.balanceOf(alice), 1 ether + 1 ether);
        assertEq(timeToken.balanceOf(bob), 1 ether + 1 ether);
    }

    function test__OnlyHumanBondCanMintMilestone() public {
        vm.expectRevert();
        milestoneNFT.mintMilestone(alice, 1);
    }

    //////////------------------CHAINLINK TESTS------------------//////////

    function test__AutomationNotTriggeredBeforeOneYear() public {
        vm.startPrank(alice);
        humanBond.propose(
            bob,
            1,
            1111,
            uint256[8]([uint256(0), 0, 0, 0, 0, 0, 0, 0])
        );
        vm.stopPrank();

        vm.startPrank(bob);
        humanBond.accept(
            alice,
            1,
            2222,
            uint256[8]([uint256(0), 0, 0, 0, 0, 0, 0, 0])
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 300 days);

        (bool needed, ) = humanBond.checkUpkeep("");
        assertFalse(needed);
    }

    function test__CannotMintMilestoneTwice() public {
        // marry
        vm.startPrank(alice);
        humanBond.propose(
            bob,
            1,
            1111,
            uint256[8]([uint256(0), 0, 0, 0, 0, 0, 0, 0])
        );
        vm.stopPrank();
        vm.startPrank(bob);
        humanBond.accept(
            alice,
            1,
            2222,
            uint256[8]([uint256(0), 0, 0, 0, 0, 0, 0, 0])
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 380 days);

        (, bytes memory data) = humanBond.checkUpkeep("");
        humanBond.performUpkeep(data);

        // second call should mint nothing
        (bool needed2, ) = humanBond.checkUpkeep("");
        assertFalse(needed2);
    }

    function test__MilestoneTokenURI() public {
        vm.startPrank(alice);
        humanBond.propose(
            bob,
            1,
            1111,
            uint256[8]([uint256(0), 0, 0, 0, 0, 0, 0, 0])
        );
        vm.stopPrank();

        vm.startPrank(bob);
        humanBond.accept(
            alice,
            1,
            2222,
            uint256[8]([uint256(0), 0, 0, 0, 0, 0, 0, 0])
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 380 days);
        (, bytes memory data) = humanBond.checkUpkeep("");
        humanBond.performUpkeep(data);

        string memory uri = milestoneNFT.tokenURI(0);
        assertEq(uri, "ipfs://QmPAVmWBuJnNgrGrAp34CqTa13VfKkEZkZak8d6E4MJio8");
    }

    function test__ChainlinkAutomationFlow() public {
        //1. Alice proposes to Bob
        vm.startPrank(alice);
        humanBond.propose(
            bob,
            1, // marriageId
            1111, // nullifier
            [uint256(0), 0, 0, 0, 0, 0, 0, 0] // mock proof
        );
        vm.stopPrank();

        // 2. Bob accepts proposal
        vm.startPrank(bob);
        humanBond.accept(alice, 1, 2222, [uint256(0), 0, 0, 0, 0, 0, 0, 0]);
        vm.stopPrank();

        // 3. Warp time more than 1 year
        vm.warp(block.timestamp + 380 days);

        // 4. Call checkUpkeep()
        (bool upkeepNeeded, bytes memory performData) = humanBond.checkUpkeep(
            ""
        );

        assertTrue(upkeepNeeded, "Upkeep should be needed after 1y");

        // 5. Call performUpkeep()
        humanBond.performUpkeep(performData);

        // 6. Assert milestone NFTs were minted
        uint256 aliceToken = 0;
        uint256 bobToken = 1;

        assertEq(milestoneNFT.ownerOf(aliceToken), alice);
        assertEq(milestoneNFT.ownerOf(bobToken), bob);

        assertEq(milestoneNFT.tokenYear(0), 1);
        assertEq(milestoneNFT.tokenYear(1), 1);
    }
}
