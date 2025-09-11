import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthContext';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Sprout, TrendingUp, Calendar, Plus, BarChart3 } from 'lucide-react';
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<CropPrediction[]>([]);
  const [loading, setLoading] = useState(true);

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
        </div>

       
      </div>
    </div>
  );
};

export default Dashboard;