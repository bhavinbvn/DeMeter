import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import ChatBot from "@/components/Chatbot";
// import { getSoilConditions, type SoilCondition } from "@/lib/firebase";
// import { getWeatherData, type WeatherData } from "@/lib/weather"; // assume you have this
import { BarChart } from "lucide-react";

import Navigation from '@/components/Navigation';
import { Header } from '@/components/Header';

import { 
  TestTube, 
  Cloud, 
  Loader2, 
  Sprout, 
  FlaskConical, 
  Droplets, 
  Leaf, 
  CircleDot, 
  Zap,
  Thermometer,
  Droplet,
  Gauge,
} from 'lucide-react';
import { getSoilConditions, type SoilCondition } from '@/lib/firebase';

interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
}

const getWeatherData = async (): Promise<WeatherData> => {
  // Replace this with actual weather API integration
  return {
    temperature: 20.9,
    rainfall: 0.00,
    humidity: 82,
  };
};

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-muted-foreground">Loading data...</p>
  </div>
);

const DEVICE_ID = 'Device_0001';
const API_URL = "http://127.0.0.1:5000/predict-crop";
const API_URL_FOR_FERTILIZER = "http://127.0.0.1:5000/recommend-fertilizer";


const CropRecommendation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [soilData, setSoilData] = useState<SoilCondition | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [recommendedCrops, setRecommendedCrops] = useState<string[]>([]);
  const [confidenceScores, setConfidenceScores] = useState<number[]>([]);
  const [cropAnalysis, setCropAnalysis] = useState<CropAnalysis | null>(null);
  const [storedCrop, setStoredCrop] = useState<any>(null); // Adjust type as necessary
    const [savedCrop, setSavedCrop] = useState<SavedCrop | null>(null);
     
  const [recommendedFertilizer, setRecommendedFertilizer] = useState<string>('');

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const fetchData = async () => {
      try {
        setLoading(true);

        unsubscribe = getSoilConditions(DEVICE_ID, async (soil) => {
          if (soil) {
            setSoilData(soil);

            const weather = await getWeatherData();
            setWeatherData(weather);

            // Call AI API
            try {
              const requestData = {
                nitrogen: soil.nitrogen_level,
                phosphorus: soil.phosphorus_level,
                potassium: soil.potassium_level,
                temperature: soil.temperature,
                humidity: soil.humidity,
                ph: soil.soil_ph,
                rainfall: weather.rainfall,
                crop: soil.crop,
              };

              const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
              });

              if (!response.ok) throw new Error(`API Error: ${response.status}`);

              const data = await response.json();
              setRecommendedCrops(data.recommended_crops);
              setConfidenceScores(data.confidence);

              // Analyze crop health
              try {
                const analysisResponse = await fetch("http://127.0.0.1:5000/analyze-crop", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    crop: soil.crop, // Use first recommended crop
                    nitrogen: soil.nitrogen_level,
                    phosphorus: soil.phosphorus_level,
                    potassium: soil.potassium_level,
                    temperature: soil.temperature,
                    humidity: soil.humidity,
                    ph: soil.soil_ph,
                    rainfall: weather.rainfall,
                  }),
                });

                if (!analysisResponse.ok) throw new Error(`Analysis API Error: ${analysisResponse.status}`);
                const analysisData = await analysisResponse.json();
                setCropAnalysis(analysisData);

                const fertilizerResponse = await fetch(API_URL_FOR_FERTILIZER, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  crop: data.recommended_crops[0].toLowerCase(),
                  nitrogen: soil.nitrogen_level,
                  phosphorus: soil.phosphorus_level,
                  potassium: soil.potassium_level,
                  temperature: soil.temperature,
                  humidity: soil.humidity,
                  ph: soil.soil_ph,
                  rainfall: weather.rainfall,
                }),
              });

              if (!fertilizerResponse.ok) throw new Error(`Fertilizer API Error: ${fertilizerResponse.status}`);
              
              const fertilizerData = await fertilizerResponse.json();
              setRecommendedFertilizer(fertilizerData.recommended_fertilizer);
            

              } catch (analysisError) {
                console.error("Analysis API failed:", analysisError);
              }

            } catch (apiError) {
              console.error("API failed, using fallback:", apiError);

              // Fallback logic
              const crop = fallbackCropLogic(soil, weather);
              setRecommendedCrops([crop]);
              setConfidenceScores([0.6]);
            }

          } else {
            toast({
              title: "Error",
              description: "No soil data found for this device",
              variant: "destructive"
            });
          }
          setLoading(false);
        });

      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [toast]);

  // Fallback rule-based prediction
  const fallbackCropLogic = (soil: SoilCondition, weather: WeatherData): string => {
    if (
      soil.soil_ph >= 6.0 && soil.soil_ph <= 7.0 &&
      soil.nitrogen_level >= 40 &&
      soil.temperature >= 20
    ) {
      return "Rice";
    } else if (
      soil.soil_ph >= 6.5 && soil.soil_ph <= 7.5 &&
      soil.phosphorus_level >= 30
    ) {
      return "Wheat";
    }
    return "Unable to determine optimal crop";
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        pageName="Device Details" 
        userName={user?.email?.split('@')[0] || 'User'} 
      />
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Soil Conditions */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TestTube className="h-6 w-6 mr-2 text-primary" />
              Soil Conditions
            </CardTitle>
            <CardDescription>Current soil parameters from IoT sensors</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 mr-2">
            <ConditionItem icon={<FlaskConical className="h-5 w-5 text-primary" />} label="Soil pH" value={soilData?.soil_ph} />
            <ConditionItem icon={<Droplets className="h-5 w-5 text-blue-500" />} label="Soil Moisture (%)" value={soilData?.soil_moisture} />
            <ConditionItem icon={<Leaf className="h-5 w-5 text-green-500" />} label="Nitrogen (mg/kg)" value={soilData?.nitrogen_level} />
            <ConditionItem icon={<CircleDot className="h-5 w-5 text-orange-500" />} label="Phosphorus (mg/kg)" value={soilData?.phosphorus_level} />
            <ConditionItem icon={<Zap className="h-5 w-5 text-yellow-500" />} label="Potassium (mg/kg)" value={soilData?.potassium_level} />
          </CardContent>
        </Card>

        {/* Weather Conditions */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Cloud className="h-6 w-6 mr-2 text-primary" />
              Weather Conditions
            </CardTitle>
            <CardDescription>Current weather parameters</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-6">
            <ConditionItem icon={<Thermometer className="h-5 w-5 text-red-500" />} label="Temperature" value={`${soilData?.temperature}°C`} />
            <ConditionItem icon={<Droplet className="h-5 w-5 text-blue-500" />} label="Rainfall" value={`${weatherData?.rainfall} mm`} />
            <ConditionItem icon={<Gauge className="h-5 w-5 text-purple-500" />} label="Humidity" value={`${soilData?.humidity}%`} />
          </CardContent>
        </Card>

       

        {/* Current Crop */}
        <Card className="bg-primary/5 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Sprout className="h-6 w-6 mr-2 text-green-500" />
              Current Crop
            </CardTitle>
            <CardDescription>Currently growing crop for this device</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {soilData?.crop ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary mb-2">
                    {(soilData.crop).toLocaleUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(soilData.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/crop-recommendation')}
                >
                  Get New Recommendation
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">No crop currently set</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/crop-recommendation')}
                >
                  Get Crop Recommendation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crop Health Analysis */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TestTube className="h-6 w-6 mr-2 text-primary" />
              Crop Health Analysis
            </CardTitle>
            <CardDescription>
              Soil parameters analysis for {cropAnalysis?.crop || 'recommended crop'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cropAnalysis && Object.entries(cropAnalysis.analysis).map(([param, status]) => (
                <div 
                  key={param}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium capitalize">{param}</h3>
                    <Badge 
                      variant={
                        status === 'OPTIMAL' ? 'default' : 
                        status === 'LOW' ? 'destructive' : 
                        'warning'
                      }
                    >
                      {status}
                    </Badge>
                  </div>
                  {cropAnalysis.ideal_ranges[param] && (
                    <div className="text-sm text-muted-foreground">
                      <p>Ideal range: {cropAnalysis.ideal_ranges[param].min.toFixed(1)} - {cropAnalysis.ideal_ranges[param].max.toFixed(1)}</p>
                      <p>Average: {cropAnalysis.ideal_ranges[param].mean.toFixed(1)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This analysis shows whether each parameter is within optimal range for the recommended crop. 
                Adjust farming practices based on parameters that are below or above optimal levels.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 shadow-lg hover:shadow-xl transition-shadow duration-300 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <TestTube className="h-6 w-6 mr-2 text-blue-500" />
                      Fertilizer Recommendation
                    </CardTitle>
                    <CardDescription>
                      Recommended fertilizer based on soil analysis and selected crop
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {soilData.crop && recommendedFertilizer ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Current crop</Badge>
                          <span className="text-muted-foreground">{soilData.crop}</span>
                        </div>
                        <div className="bg-background p-4 rounded-lg border">
                          <p className="text-lg font-medium text-primary">
                            {recommendedFertilizer}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Apply fertilizer according to the recommended ratio and local agricultural guidelines.
                        </p>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">
                        Select a crop to get fertilizer recommendations
                      </p>
                    )}
                  </CardContent>
                </Card>
                <div id="n8n-chat-container"></div>
                <ChatBot />
      </div>
      
    </div>
  );
};

// Helper UI Component
const ConditionItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) => (
  <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
    {icon}
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value ?? '--'}</p>
    </div>
  </div>
);

export default CropRecommendation;
