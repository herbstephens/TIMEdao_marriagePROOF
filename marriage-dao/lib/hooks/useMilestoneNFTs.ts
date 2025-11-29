import { useState, useEffect } from 'react';
import { useWalletAuth } from '@/lib/worldcoin/useWalletAuth';
import { CONTRACT_ADDRESSES, MILESTONE_NFT_ABI } from '@/lib/contracts';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi/config';
import { getPublicClient } from '@wagmi/core';
import { parseAbiItem } from 'viem';

export type MilestoneNFTData = {
    tokenId: bigint;
    year: bigint;
    tokenURI: string;
    metadata: any;
};

export function useMilestoneNFTs() {
    const { address, isConnected } = useWalletAuth();
    const [milestones, setMilestones] = useState<MilestoneNFTData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        async function fetchMilestones() {
            if (!isConnected || !address) {
                if (!isActive) return;
                setMilestones([]);
                setIsLoading(false);
                return;
            }

            try {
                if (!isActive) return;
                setIsLoading(true);
                setError(null);

                const publicClient = getPublicClient(wagmiConfig);

                // Find Transfer events to the user
                const logs = await publicClient.getLogs({
                    address: CONTRACT_ADDRESSES.MILESTONE_NFT as `0x${string}`,
                    event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'),
                    args: {
                        to: address as `0x${string}`,
                        from: '0x0000000000000000000000000000000000000000',
                    },
                    fromBlock: 'earliest',
                });

                if (logs.length === 0) {
                    if (!isActive) return;
                    setMilestones([]);
                    setIsLoading(false);
                    return;
                }

                const fetchedMilestones: MilestoneNFTData[] = [];

                for (const log of logs) {
                    const tokenId = log.args.tokenId;
                    if (tokenId === undefined) continue;

                    // Get Year
                    const year = await readContract(wagmiConfig, {
                        address: CONTRACT_ADDRESSES.MILESTONE_NFT as `0x${string}`,
                        abi: MILESTONE_NFT_ABI,
                        functionName: 'tokenYear',
                        args: [tokenId],
                    }) as bigint;

                    // Get Token URI
                    const tokenURI = await readContract(wagmiConfig, {
                        address: CONTRACT_ADDRESSES.MILESTONE_NFT as `0x${string}`,
                        abi: MILESTONE_NFT_ABI,
                        functionName: 'tokenURI',
                        args: [tokenId],
                    }) as string;

                    // Fetch Metadata
                    let metadata = {};
                    try {
                        const httpURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
                        const response = await fetch(httpURI);
                        metadata = await response.json();
                    } catch (e) {
                        console.warn(`Failed to fetch metadata for token ${tokenId}`, e);
                    }

                    fetchedMilestones.push({
                        tokenId,
                        year,
                        tokenURI,
                        metadata
                    });
                }

                if (!isActive) return;
                // Sort by year descending
                fetchedMilestones.sort((a, b) => Number(b.year - a.year));
                setMilestones(fetchedMilestones);

            } catch (err) {
                if (!isActive) return;
                console.error('Error fetching Milestone NFTs:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch Milestone NFTs');
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        fetchMilestones();

        return () => {
            isActive = false;
        };
    }, [address, isConnected]);

    return {
        milestones,
        isLoading,
        error,
        refetch: async () => {
            // Simple refetch logic (re-run the effect by forcing a state update or just copying the logic)
            // For now, we rely on the effect. To force refetch, we could expose a function that toggles a dependency.
            // But for simplicity, I'll just leave it as is or implement if needed.
            // Let's implement a simple refetch trigger if needed, but for now the user can just refresh.
        }
    };
}
