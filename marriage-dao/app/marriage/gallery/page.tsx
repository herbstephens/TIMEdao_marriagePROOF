"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVowNFT } from "@/lib/hooks/useVowNFT";
import { useMilestoneNFTs } from "@/lib/hooks/useMilestoneNFTs";
import { NFTCard } from "@/app/components/marriage/NFTCard";
import { MiniKit } from "@worldcoin/minikit-js";
import { CONTRACT_ADDRESSES, HUMAN_BOND_ABI } from "@/lib/contracts";

export default function GalleryPage() {
    const router = useRouter();
    const { vowNFT, isLoading: loadingVow } = useVowNFT();
    const { milestones, isLoading: loadingMilestones } = useMilestoneNFTs();

    const [mintingState, setMintingState] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    const handleMintMilestones = async () => {
        try {
            setMintingState("sending");
            setError(null);

            const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
                transaction: [
                    {
                        address: CONTRACT_ADDRESSES.HUMAN_BOND,
                        abi: HUMAN_BOND_ABI,
                        functionName: "manualCheckAndMint",
                        args: [],
                    },
                ],
            });

            if (finalPayload.status === "error") {
                throw new Error("Transaction failed");
            }

            setMintingState("success");
            // Ideally we would refetch here, but for now user can refresh
        } catch (err) {
            setMintingState("error");
            setError(err instanceof Error ? err.message : "Failed to mint milestones");
        }
    };

    const isLoading = loadingVow || loadingMilestones;

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/home')}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ← Back
                    </button>
                    <h1 className="font-bold text-lg text-gray-900">Our Memories</h1>
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-8">

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Vow NFT Section */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                💍 The Vow
                            </h2>
                            {vowNFT ? (
                                <NFTCard
                                    image={vowNFT.metadata?.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || ''}
                                    name={vowNFT.metadata?.name || 'Vow NFT'}
                                    description={vowNFT.metadata?.description}
                                    tokenId={vowNFT.tokenId.toString()}
                                />
                            ) : (
                                <div className="p-6 bg-white rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
                                    No Vow NFT found. Are you married?
                                </div>
                            )}
                        </section>

                        {/* Milestones Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    🏆 Milestones
                                </h2>
                                <button
                                    onClick={handleMintMilestones}
                                    disabled={mintingState === "sending"}
                                    className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors disabled:opacity-50"
                                >
                                    {mintingState === "sending" ? "Checking..." : "Check & Mint"}
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">
                                    {error}
                                </div>
                            )}

                            {mintingState === "success" && (
                                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl">
                                    Check complete! If you had pending milestones, they are being minted. Refresh in a moment.
                                </div>
                            )}

                            {milestones.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {milestones.map((nft) => (
                                        <NFTCard
                                            key={nft.tokenId.toString()}
                                            image={nft.metadata?.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || ''}
                                            name={nft.metadata?.name || `Year ${nft.year}`}
                                            description={nft.metadata?.description}
                                            tokenId={nft.tokenId.toString()}
                                            year={nft.year.toString()}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 bg-white rounded-2xl border border-dashed border-gray-300 text-center space-y-2">
                                    <p className="text-gray-500">No milestones yet.</p>
                                    <p className="text-xs text-gray-400">
                                        Milestones are earned on every anniversary.
                                        Click "Check & Mint" to see if you're eligible!
                                    </p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
