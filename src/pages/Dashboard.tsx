import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthContext';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import ChatBot from '@/components/Chatbot';
import { Sprout, TrendingUp, Calendar, Plus, BarChart3, Camera, Upload, AlertTriangle, Video, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/Header';

interface CropPrediction {
  id: string;
  crop_type: string;
  predicted_yield: number;
  confidence_score: number;
  created_at: string;
  field_area: number;
}

interface DiseaseDetection {
  plant_name: string;
  disease: string;
  confidence: number;
  severity: string;
  treatment: string;
  description: string;
  prevention: string;
}

interface ApiError {
  message: string;
  code?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<CropPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [diseaseResult, setDiseaseResult] = useState<DiseaseDetection | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (user) {
      fetchPredictions();
    }
  }, [user]);

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('crop_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setShowDiseaseModal(true);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      setShowDiseaseModal(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setApiError({
        message: 'Unable to access camera. Please check permissions.',
        code: 'CAMERA_ACCESS_ERROR'
      });
      setShowDiseaseModal(true);
    }
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          setSelectedImage(file);
          setShowCamera(false);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeDiseaseFromImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setApiError(null);
    setDiseaseResult(null);

    try {
      // Prepare form data for your backend server
      const formData = new FormData();
      formData.append('plantImage', selectedImage);
      
      // Your backend server URL
      const BACKEND_SERVER_URL = 'http://localhost:5000/api/analyze'; // Update port if different
      
      const response = await fetch(BACKEND_SERVER_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend Server Error ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      
      // Parse backend server response - adjust these field names based on your server.js response
      if (!result || (!result.plant && !result.plant_name)) {
        throw new Error('Invalid response from backend server');
      }

      // Map your backend response to the expected format
      setDiseaseResult({
        plant_name: result.plant_name || result.plant || 'Unknown Plant',
        disease: result.disease || 'No disease detected',
        confidence: Number(result.confidence) || 0,
        severity: result.severity || (result.disease === 'Healthy' || result.disease === 'No disease' ? 'None' : 'Moderate'),
        treatment: result.treatment || result.remedy || 'No treatment information available',
        description: result.description || result.details || 'No description available',
        prevention: result.prevention || (result.cause ? `Prevent by addressing: ${result.cause}` : 'Follow general plant care guidelines')
      });
      
    } catch (error) {
      console.error('Disease detection error:', error);
      
      if (error instanceof Error) {
        setApiError({
          message: error.message,
          code: error.name
        });
      } else {
        setApiError({
          message: 'An unexpected error occurred during disease analysis',
          code: 'UNKNOWN_ERROR'
        });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const resetDiseaseDetection = () => {
    setSelectedImage(null);
    setDiseaseResult(null);
    setShowDiseaseModal(false);
    setAnalyzing(false);
    setApiError(null);
    stopCamera();
  };

  const totalPredictions = predictions.length;
  const avgYield = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + (p.predicted_yield || 0), 0) / predictions.length 
    : 0;
  const avgConfidence = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / predictions.length 
    : 0;

  // Prepare chart data
  const chartData = predictions
    .slice(0, 7)
    .reverse()
    .map((p, index) => ({
      name: `Prediction ${index + 1}`,
      yield: p.predicted_yield || 0,
      confidence: (p.confidence_score || 0) * 100
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        pageName="Dashboard" 
        userName={user?.email?.split('@')[0] || 'User'} 
      />
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <Card className="agricultural-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalPredictions}</div>
              <p className="text-xs text-muted-foreground">
                Predictions made
              </p>
            </CardContent>
          </Card>

          <Card className="agricultural-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Yield</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{avgYield.toFixed(1)} kg/ha</div>
              <p className="text-xs text-muted-foreground">
                Average predicted yield
              </p>
            </CardContent>
          </Card>

          <Card className="agricultural-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confidence</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{(avgConfidence * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average confidence score
              </p>
            </CardContent>
          </Card>

          <Card className="agricultural-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link to="/prediction">
                <Button className="w-full gradient-primary text-primary-foreground">
                  New Prediction
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Device Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <Card className="agricultural-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IoT Device 1</CardTitle>
              <Sprout className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Device[0001]</div>
              <p className="text-xs text-muted-foreground mb-4">
                Soil Monitoring System
              </p>
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => navigate('/dashboard1')}
              >
                View Data
              </Button>
            </CardContent>
          </Card>

          <Card className="agricultural-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disease Detection</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">AI Analysis</div>
              <p className="text-xs text-muted-foreground mb-4">
                Upload plant image for disease detection
              </p>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="disease-image-upload"
                />
                <label htmlFor="disease-image-upload">
                  <Button className="w-full mb-2" variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </span>
                  </Button>
                </label>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={startCamera}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* <Card className="agricultural-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysis</CardTitle>
              <Sprout className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Market Based Analysis</div>
              <p className="text-xs text-muted-foreground mb-4">
               
              </p>
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => navigate('/dashboard1')}
              >
                Open
              </Button>
            </CardContent>
          </Card> */}

          {/* You can add more device cards here following the same pattern */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yield Trends Chart */}
          <Card className="agricultural-card animate-slide-up">
            <CardHeader>
              <CardTitle>Yield Trends</CardTitle>
              <CardDescription>
                Recent yield predictions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="yield" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Predictions */}
          <Card className="agricultural-card animate-slide-up">
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
              <CardDescription>
                Your latest crop yield predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictions.slice(0, 5).map((prediction) => (
                    <div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Sprout className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{prediction.crop_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(prediction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-success">
                          {prediction.predicted_yield?.toFixed(1)} kg/ha
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {((prediction.confidence_score || 0) * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link to="/history">
                    <Button variant="outline" className="w-full mt-4">
                      View All Predictions
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No predictions yet</p>
                  <Link to="/prediction">
                    <Button>Create Your First Prediction</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          <ChatBot />
        </div>

        {/* Disease Detection Modal */}
        {showDiseaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {showCamera ? 'Camera Capture' : 'Plant Disease Analysis'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetDiseaseDetection}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Camera View */}
              {showCamera && cameraStream && (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <video 
                      id="camera-video"
                      autoPlay 
                      playsInline
                      className="w-full h-64 object-cover"
                      ref={(video) => {
                        if (video && cameraStream) {
                          video.srcObject = cameraStream;
                        }
                      }}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={capturePhoto} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button onClick={stopCamera} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Image Analysis */}
              {selectedImage && !showCamera && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <img 
                      src={URL.createObjectURL(selectedImage)} 
                      alt="Selected plant" 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                  
                  {!diseaseResult && !analyzing && !apiError && (
                    <Button 
                      onClick={analyzeDiseaseFromImage} 
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Analyze with AI
                    </Button>
                  )}
                  
                  {analyzing && (
                    <div className="text-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Analyzing with Gemini AI...</p>
                    </div>
                  )}
                  
                  {apiError && (
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                          <h4 className="font-medium text-red-800">Analysis Failed</h4>
                        </div>
                        <div className="text-sm text-red-700">
                          <p><strong>Error:</strong> {apiError.message}</p>
                          {apiError.code && (
                            <p><strong>Code:</strong> {apiError.code}</p>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={analyzeDiseaseFromImage}
                        variant="outline"
                        className="w-full"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                  
                  {diseaseResult && (
                    <div className="space-y-4">
                      {/* Plant Information */}
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Plant Information</h4>
                        <p className="text-sm text-green-700">
                          <strong>Species:</strong> {diseaseResult.plant_name}
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          {diseaseResult.description}
                        </p>
                      </div>
                      
                      {/* Disease Analysis */}
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                          <h4 className="font-medium">{diseaseResult.disease}</h4>
                        </div>
                        <div className="text-sm space-y-2">
                          <p><strong>Confidence:</strong> {diseaseResult.confidence.toFixed(1)}%</p>
                          <p><strong>Severity:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              diseaseResult.severity === 'High' ? 'bg-red-100 text-red-800' :
                              diseaseResult.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                              diseaseResult.severity === 'None' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {diseaseResult.severity}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      {/* Treatment */}
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Treatment Recommendations</h4>
                        <p className="text-sm text-blue-700">{diseaseResult.treatment}</p>
                      </div>
                      
                      {/* Prevention */}
                      <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-2">Prevention & Care</h4>
                        <p className="text-sm text-purple-700">{diseaseResult.prevention}</p>
                      </div>
                      
                      <Button 
                        onClick={resetDiseaseDetection}
                        variant="outline"
                        className="w-full"
                      >
                        Analyze Another Image
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;