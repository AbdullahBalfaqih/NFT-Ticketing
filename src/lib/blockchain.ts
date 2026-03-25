
import { ethers } from 'ethers';

const ABI = [
  "function mint(address to, uint256 eventId) external",
  "function ticketEventId(uint256 tokenId) public view returns (uint256)",
  "function setBaseURI(string memory _newBaseURI) external",
  "function setBaseUrl(string memory _newBaseUrl) external",
  "function setURI(string memory _newURI) external",
  "function owner() public view returns (address)",
  "function getOwner() public view returns (address)",
  "function admin() public view returns (address)",
  "function admins(address) public view returns (bool)",
  "function hasRole(bytes32 role, address account) public view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() public view returns (bytes32)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export async function mintTicketOnChain(toAddress: string, eventId: number) {
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    throw new Error('Missing blockchain configuration in environment variables.');
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, ABI, wallet);

    console.log(`Minting ticket for event ${eventId} to address ${toAddress}...`);
    
    const tx = await contract.mint(toAddress, eventId);
    const receipt = await tx.wait();

    let tokenId = null;
    const transferTopic = ethers.id("Transfer(address,address,uint256)");
    const log = receipt.logs.find((l: any) => l.topics[0] === transferTopic);
    
    if (log) {
      tokenId = ethers.toBigInt(log.topics[3]).toString();
    }

    return {
      success: true,
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      tokenId: tokenId
    };
  } catch (error: any) {
    console.error('Blockchain Minting Error:', error);
    throw new Error(error.message || 'Failed to mint ticket on blockchain');
  }
}

export async function updateContractBaseURI(newBaseURI: string) {
  const rpcUrl = process.env.RPC_URL;
  const privateKeyRaw = process.env.PRIVATE_KEY?.trim();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim();

  if (!rpcUrl || !privateKeyRaw || !contractAddress) {
    throw new Error('Configuration missing (RPC_URL, PRIVATE_KEY, or CONTRACT_ADDRESS)');
  }

  const privateKey = privateKeyRaw.startsWith('0x') ? privateKeyRaw : `0x${privateKeyRaw}`;

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, ABI, wallet);

    const functionsToTry = ["setBaseURI", "setBaseUrl", "setURI"];
    let lastError = "";

    for (const funcName of functionsToTry) {
      try {
        console.log(`Attempting to sync with ${funcName}...`);
        
        // إرسال المعاملة مباشرة بدون محاكاة الغاز لتجنب أخطاء التقدير الوهمية
        const tx = await contract[funcName](newBaseURI, {
          gasLimit: 200000 // حد غاز كافٍ لمعاملة بسيطة
        });
        
        const receipt = await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (err: any) {
        lastError = err.message;
        if (err.message.includes("is not a function")) continue;
        
        if (err.message.includes("execution reverted")) {
          throw new Error(`Blockchain Rejected: The contract strictly refused this wallet. Check if you granted the specific URI_SETTER role to ${wallet.address}`);
        }
        break; 
      }
    }

    throw new Error(`Sync Failed. Technical info: ${lastError.substring(0, 150)}`);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
