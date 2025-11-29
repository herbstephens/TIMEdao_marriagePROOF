import Image from 'next/image';

interface NFTCardProps {
    image: string;
    name: string;
    description?: string;
    tokenId: string;
    year?: string;
}

export function NFTCard({ image, name, description, tokenId, year }: NFTCardProps) {
    // Fallback for IPFS images if they are not properly resolved or if next/image has issues with external domains
    // Ideally we configure next.config.js for ipfs.io, but for now we assume the hook resolves to https

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
            <div className="relative aspect-square w-full bg-gray-100">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{name}</h3>
                    {year && (
                        <span className="shrink-0 px-2 py-1 text-xs font-bold text-amber-800 bg-amber-100 rounded-full">
                            Year {year}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Token ID: #{tokenId}</span>
                </div>

                {description && (
                    <p className="text-sm text-gray-600 line-clamp-2" title={description}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
