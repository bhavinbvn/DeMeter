import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

const firebaseConfig = {
   apiKey: "AIzaSyADfJxA7H_UxpWNkg7I-rWxh4Jxi4XVTbo",
  authDomain: "crop-prediction-30dbd.firebaseapp.com",
  projectId: "crop-prediction-30dbd",
  storageBucket: "crop-prediction-30dbd.firebasestorage.app",
  messagingSenderId: "250652803822",
  appId: "1:250652803822:web:f6fa29ae44432f8fc1a9ff",
  measurementId: "G-HDNV9KTY5B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export interface SoilCondition {
  humidity: number;
  temperature: number;
  soil_ph: number;
  soil_moisture: number;
  nitrogen_level: number;
  phosphorus_level: number;
  potassium_level: number;
  last_updated: string;
  crop:string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export const getSoilConditions = (deviceId: string, callback: (data: SoilCondition | null) => void) => {
  const soilRef = ref(db, `soil_conditions/${deviceId}`);
  
  onValue(soilRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data as SoilCondition);
    } else {
      callback(null);
    }
  });

  // Return cleanup function
  return () => off(soilRef);
};