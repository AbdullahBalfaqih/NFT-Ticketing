'use server';

import { updateContractBaseURI } from '@/lib/blockchain';

export async function syncContractMetadata(origin: string) {
  try {
    if (!origin) throw new Error('Origin URL is missing');
    
    // الرابط يجب أن ينتهي بـ / لكي يضيف البلوكشين رقم التوكن بعده
    const baseURI = `${origin}/api/nft/`;
    console.log('Syncing Contract Metadata to:', baseURI);
    
    const result = await updateContractBaseURI(baseURI);
    return result;
  } catch (error: any) {
    console.error('Action Sync Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync metadata'
    };
  }
}
