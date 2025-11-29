/**
 * Purpose: Contract addresses and configurations for Marriage DAO
 * Contains deployed contract addresses on Worldchain Mainnet
 */

// Contract Addresses on Worldchain Mainnet (Chain ID: 480)
export const CONTRACT_ADDRESSES = {
  HUMAN_BOND: '0x8547412ca42cd3aac734d15a0cd566fd91454c0c' as const,
  VOW_NFT: '0xaa8b0e47649a93f3092967dfc83287c7293c8fe7' as const,
  MILESTONE_NFT: '0x57302a1cc1597c573a7acc12876146dd7919bf49' as const,
  TIME_TOKEN: '0xd7dff24b9d0e217c0876b70944176d1415153c8b' as const,
} as const

// World App Configuration
export const WORLD_APP_CONFIG = {
  APP_ID: 'app_bfc3261816aeadc589f9c6f80a98f5df' as `app_${string}`,
  ACTIONS: {
    PROPOSE_BOND: 'propose-bond',
    ACCEPT_BOND: 'accept-bond',
  },
} as const



// VowNFT ABI
export const VOW_NFT_ABI = [
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true, internalType: 'address' },
      { name: 'to', type: 'address', indexed: true, internalType: 'address' },
      { name: 'tokenId', type: 'uint256', indexed: true, internalType: 'uint256' },
    ],
    anonymous: false,
  },
] as const

// MilestoneNFT ABI
export const MILESTONE_NFT_ABI = [
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenYear',
    inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true, internalType: 'address' },
      { name: 'to', type: 'address', indexed: true, internalType: 'address' },
      { name: 'tokenId', type: 'uint256', indexed: true, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MilestoneMinted',
    inputs: [
      { name: 'user', type: 'address', indexed: true, internalType: 'address' },
      { name: 'year', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'tokenId', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'timestamp', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
] as const

// HumanBond ABI - Only the functions we need
export const HUMAN_BOND_ABI = [
  {
    type: 'function',
    name: 'propose',
    inputs: [
      { name: 'proposed', type: 'address', internalType: 'address' },
      { name: 'root', type: 'uint256', internalType: 'uint256' },
      { name: 'proposerNullifier', type: 'uint256', internalType: 'uint256' },
      { name: 'proof', type: 'uint256[8]', internalType: 'uint256[8]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'accept',
    inputs: [
      { name: 'proposer', type: 'address', internalType: 'address' },
      { name: 'root', type: 'uint256', internalType: 'uint256' },
      { name: 'acceptorNullifier', type: 'uint256', internalType: 'uint256' },
      { name: 'proof', type: 'uint256[8]', internalType: 'uint256[8]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getProposal',
    inputs: [{ name: 'proposer', type: 'address', internalType: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct HumanBond.Proposal',
        components: [
          { name: 'proposer', type: 'address', internalType: 'address' },
          { name: 'proposed', type: 'address', internalType: 'address' },
          { name: 'proposerNullifier', type: 'uint256', internalType: 'uint256' },
          { name: 'accepted', type: 'bool', internalType: 'bool' },
          { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserDashboard',
    inputs: [{ name: 'user', type: 'address', internalType: 'address' }],
    outputs: [
      {
        name: 'd',
        type: 'tuple',
        internalType: 'struct HumanBond.UserDashboard',
        components: [
          { name: 'isMarried', type: 'bool', internalType: 'bool' },
          { name: 'hasProposal', type: 'bool', internalType: 'bool' },
          { name: 'partner', type: 'address', internalType: 'address' },
          { name: 'pendingYield', type: 'uint256', internalType: 'uint256' },
          { name: 'timeBalance', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasPendingProposal',
    inputs: [{ name: 'proposer', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'ProposalCreated',
    inputs: [
      { name: 'proposer', type: 'address', indexed: true, internalType: 'address' },
      { name: 'proposed', type: 'address', indexed: true, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProposalAccepted',
    inputs: [
      { name: 'partnerA', type: 'address', indexed: true, internalType: 'address' },
      { name: 'partnerB', type: 'address', indexed: true, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'claimYield',
    inputs: [{ name: 'partner', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'divorce',
    inputs: [{ name: 'partner', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'manualCheckAndMint',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'MarriageDissolved',
    inputs: [
      { name: 'partnerA', type: 'address', indexed: true, internalType: 'address' },
      { name: 'partnerB', type: 'address', indexed: true, internalType: 'address' },
      { name: 'timestamp', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'YieldClaimed',
    inputs: [
      { name: 'partnerA', type: 'address', indexed: true, internalType: 'address' },
      { name: 'partnerB', type: 'address', indexed: true, internalType: 'address' },
      { name: 'rewardEach', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
] as const


