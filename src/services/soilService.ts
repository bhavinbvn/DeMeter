import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface SoilData {
  soil_ph: number;
  soil_moisture: number;
  nitrogen_level: number;
  phosphorus_level: number;
  potassium_level: number;
}

export const getSoilData = async (userId: string): Promise<SoilData> => {
  try {
    const soilDoc = await getDoc(doc(db, 'soil_conditions', userId));
    
    if (!soilDoc.exists()) {
      throw new Error('No soil data found for this user');
    }
    
    return soilDoc.data() as SoilData;
  } catch (error) {
    console.error('Error fetching soil data:', error);
    throw new Error('Failed to fetch soil conditions');
  }
};