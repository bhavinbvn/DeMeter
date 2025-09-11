import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { Header } from '@/components/Header';
import { 
  TrendingUp, 
  Droplets, 
  Sprout, 
  AlertCircle, 
  CheckCircle, 
  Info,
  ArrowLeft,
  Calendar,
  BarChart3
} from 'lucide-react';

interface Prediction {
  id: string;
  crop_type: string;
  field_area: number;
  predicted_yield: number;
  confidence_score: number;
  recommendations: any;
  created_at: string;
  soil_ph?: number;
  soil_moisture?: number;
  temperature?: number;
  rainfall?: number;
  humidity?: number;
  irrigation_method?: string;
  fertilizer_used?: string;
}

const PredictionResult = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchPrediction();
    }
  }, [id, user]);

  const fetchPrediction = async () => {
    try {
      const { data, error } = await supabase
        .from('crop_predictions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setPrediction(data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prediction results...</p>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Prediction Not Found</h1>
          <p className="text-muted-foreground mb-6">The prediction you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
       <Header 
              pageName="Prediction Results" 
              userName={user?.email?.split('@')[0] || 'User'} 
            />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Prediction Results
              </h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(prediction.created_at)}
                </div>
                <div className="flex items-center">
                  <Sprout className="h-4 w-4 mr-1" />
                  {prediction.crop_type}
                </div>
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {prediction.field_area} hectares
                </div>
              </div>
            </div>
            
            <Badge 
              variant={prediction.confidence_score >= 0.8 ? 'default' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {getConfidenceBadge(prediction.confidence_score)} Confidence
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Yield Prediction Card */}
            <Card className="agricultural-card animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Predicted Yield
                </CardTitle>
                <CardDescription>
                  AI-generated yield prediction for your {prediction.crop_type} crop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <div className="text-5xl font-bold text-success mb-2">
                    {prediction.predicted_yield.toFixed(1)}
                  </div>
                  <div className="text-lg text-muted-foreground mb-4">kg/hectare</div>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-primary">
                        {(prediction.predicted_yield * prediction.field_area).toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Expected (kg)</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-semibold ${getConfidenceColor(prediction.confidence_score)}`}>
                        {(prediction.confidence_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Confidence Score</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="agricultural-card animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  Actionable insights to optimize your crop yield
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prediction.recommendations?.irrigation && (
                    <div className="flex items-start space-x-3 p-4 bg-accent-light rounded-lg">
                      <Droplets className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Irrigation</h4>
                        <p className="text-sm text-muted-foreground">{prediction.recommendations.irrigation}</p>
                      </div>
                    </div>
                  )}
                  
                  {prediction.recommendations?.fertilizer && (
                    <div className="flex items-start space-x-3 p-4 bg-primary-light rounded-lg">
                      <Sprout className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Fertilizer</h4>
                        <p className="text-sm text-muted-foreground">{prediction.recommendations.fertilizer}</p>
                      </div>
                    </div>
                  )}
                  
                  {prediction.recommendations?.pest_control && (
                    <div className="flex items-start space-x-3 p-4 bg-warning/20 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Pest Control</h4>
                        <p className="text-sm text-muted-foreground">{prediction.recommendations.pest_control}</p>
                      </div>
                    </div>
                  )}
                  
                  {prediction.recommendations?.general && (
                    <div className="flex items-start space-x-3 p-4 bg-secondary/50 rounded-lg">
                      <Info className="h-5 w-5 text-secondary-dark mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">General</h4>
                        <p className="text-sm text-muted-foreground">{prediction.recommendations.general}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Input Parameters */}
          <div className="space-y-6">
            <Card className="agricultural-card animate-slide-up">
              <CardHeader>
                <CardTitle>Input Parameters</CardTitle>
                <CardDescription>
                  Data used for this prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Crop Type</span>
                    <span className="text-sm font-medium">{prediction.crop_type}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Field Area</span>
                    <span className="text-sm font-medium">{prediction.field_area} ha</span>
                  </div>
                  
                  {prediction.soil_ph && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Soil pH</span>
                      <span className="text-sm font-medium">{prediction.soil_ph}</span>
                    </div>
                  )}
                  
                  {prediction.soil_moisture && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Soil Moisture</span>
                      <span className="text-sm font-medium">{prediction.soil_moisture}%</span>
                    </div>
                  )}
                  
                  {prediction.temperature && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Temperature</span>
                      <span className="text-sm font-medium">{prediction.temperature}°C</span>
                    </div>
                  )}
                  
                  {prediction.rainfall && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rainfall</span>
                      <span className="text-sm font-medium">{prediction.rainfall} mm</span>
                    </div>
                  )}
                  
                  {prediction.humidity && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Humidity</span>
                      <span className="text-sm font-medium">{prediction.humidity}%</span>
                    </div>
                  )}
                  
                  {prediction.irrigation_method && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Irrigation</span>
                      <span className="text-sm font-medium">{prediction.irrigation_method}</span>
                    </div>
                  )}
                  
                  {prediction.fertilizer_used && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fertilizer</span>
                      <span className="text-sm font-medium">{prediction.fertilizer_used}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="agricultural-card animate-slide-up">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/prediction">
                  <Button className="w-full" variant="default">
                    Create New Prediction
                  </Button>
                </Link>
                
                <Link to="/history">
                  <Button className="w-full" variant="outline">
                    View All Predictions
                  </Button>
                </Link>
                
                <Link to="/dashboard">
                  <Button className="w-full" variant="secondary">
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;