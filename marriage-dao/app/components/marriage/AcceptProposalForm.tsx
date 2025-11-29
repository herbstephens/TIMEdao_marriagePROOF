/**
 * Purpose: Accept Marriage Proposal Form
 * Integrates World ID verification + MiniKit sendTransaction
 * Calls HumanBond.accept() on Worldchain
 * 
 * ON-CHAIN VERIFICATION:
 * - NO SIWE or backend API needed
 * - World ID proof is verified directly on the smart contract
 * - MiniKit provides wallet address automatically via MiniKit.user
 */

"use client";

import { useState, useEffect } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { CONTRACT_ADDRESSES, HUMAN_BOND_ABI, WORLD_APP_CONFIG } from "@/lib/contracts";
import { useAuthStore } from "@/state/authStore";
import { isInWorldApp } from "@/lib/worldcoin/initMiniKit";

type AcceptState = "idle" | "verifying" | "sending" | "success" | "error";



export function AcceptProposalForm() {
  const [proposerAddress, setProposerAddress] = useState("");
  const [state, setState] = useState<AcceptState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isWorldApp, setIsWorldApp] = useState(false);


  const { walletAddress, setWalletAddress } = useAuthStore();

  // Check if running in World App on mount
  useEffect(() => {
    const checkWorldApp = () => {
      const inWorld = isInWorldApp();
      setIsWorldApp(inWorld);

      // Auto-update wallet address from MiniKit if available
      if (inWorld && MiniKit.user?.walletAddress && !walletAddress) {
        setWalletAddress(MiniKit.user.walletAddress);
      }


    };

    // Give MiniKit time to initialize
    const timer = setTimeout(checkWorldApp, 300);
    return () => clearTimeout(timer);
  }, [walletAddress, setWalletAddress]);

  /**
   * Decode World ID proof string to uint256[8] array
   * The proof comes as a packed hex string from World ID
   */
  const decodeProof = (proof: string): [string, string, string, string, string, string, string, string] => {
    // Remove 0x prefix if present
    const cleanProof = proof.startsWith("0x") ? proof.slice(2) : proof;

    // Each uint256 is 64 hex chars (32 bytes)
    const proofArray: string[] = [];
    for (let i = 0; i < 8; i++) {
      const chunk = cleanProof.slice(i * 64, (i + 1) * 64);
      proofArray.push(BigInt("0x" + chunk).toString());
    }

    return proofArray as [string, string, string, string, string, string, string, string];
  };

  /**
   * Main flow: Verify with World ID → Send Transaction
   * NO SIWE or backend API needed - verification is on-chain
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    // Validate proposer address
    if (!proposerAddress || !/^0x[a-fA-F0-9]{40}$/.test(proposerAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    // Check if in World App
    if (!isWorldApp) {
      setError("This app must be opened in World App");
      return;
    }

    try {
      // Step 1: Verify with World ID
      setState("verifying");

      // Get the user's wallet address - this will be msg.sender in the contract
      const userWallet = MiniKit.user?.walletAddress || walletAddress;

      if (!userWallet) {
        throw new Error("Wallet address not available. Please try again.");
      }



      // CRITICAL FIX: Signal must be the ACCEPTOR's address (msg.sender), not the proposer
      const { finalPayload: verifyPayload } = await MiniKit.commandsAsync.verify({
        action: WORLD_APP_CONFIG.ACTIONS.ACCEPT_BOND,
        signal: userWallet, // ✅ FIXED: Must be acceptor's wallet (msg.sender)
        verification_level: VerificationLevel.Orb,
      });



      if (verifyPayload.status === "error") {
        const errPayload = verifyPayload as any;
        throw new Error(`Verification error: ${errPayload.error_code || "cancelled"}`);
      }

      // Update wallet address from MiniKit
      if (MiniKit.user?.walletAddress) {
        setWalletAddress(MiniKit.user.walletAddress);
      }

      // Step 2: Extract proof data
      const merkleRoot = verifyPayload.merkle_root;
      const nullifierHash = verifyPayload.nullifier_hash;
      const proofArray = decodeProof(verifyPayload.proof);



      // Step 3: Send transaction via MiniKit
      setState("sending");

      const { finalPayload: txPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: CONTRACT_ADDRESSES.HUMAN_BOND,
            abi: HUMAN_BOND_ABI,
            functionName: "accept",
            args: [
              proposerAddress,
              merkleRoot,
              nullifierHash,
              proofArray,
            ],
          },
        ],
      });



      if (txPayload.status === "error") {
        const errPayload = txPayload as any;
        const errorMsg = errPayload.error_code || errPayload.message || "Unknown error";
        throw new Error(`Transaction failed: ${errorMsg}`);
      }

      // Update wallet address after transaction
      if (MiniKit.user?.walletAddress && !walletAddress) {
        setWalletAddress(MiniKit.user.walletAddress);
      }

      // Success!
      setState("success");
      setTxHash(txPayload.transaction_id || null);

    } catch (err) {
      setState("error");
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMsg);
    }
  };

  const isLoading = state === "verifying" || state === "sending";

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Container with title and input */}
        <div className="bg-[#C4C4C4] rounded-3xl p-8 space-y-6">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-normal text-black text-center">
            Accept a proposal
          </h1>

          {/* Connected Wallet Display */}
          {walletAddress && (
            <div className="text-center text-xs text-black/50">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}

          {/* Address Input */}
          <input
            type="text"
            value={proposerAddress}
            onChange={(e) => setProposerAddress(e.target.value)}
            placeholder="Address who proposed to you (0x...)"
            className="w-full px-6 py-4 rounded-full bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
            disabled={isLoading}
          />

          {/* Status Messages */}
          {state === "verifying" && (
            <p className="text-center text-black/70">Verifying with World ID...</p>
          )}
          {state === "sending" && (
            <p className="text-center text-black/70">Sending transaction...</p>
          )}
          {state === "success" && (
            <div className="text-center space-y-2">
              <p className="text-green-700 font-medium">Proposal accepted! 💒 You are now bonded!</p>
              {txHash && (
                <a
                  href={`https://worldscan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  View on WorldScan
                </a>
              )}
            </div>
          )}
          {error && (
            <p className="text-center text-red-600 text-sm">{error}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-black text-white px-8 py-4 rounded-full text-lg font-normal hover:bg-black/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!proposerAddress || isLoading || !isWorldApp}
        >
          {isLoading ? "Processing..." : "Accept Proposal"}
        </button>
      </form>


    </div>
  );
}
