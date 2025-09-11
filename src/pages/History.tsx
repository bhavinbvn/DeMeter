import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/Navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { 
  Calendar, 
  Sprout, 
  TrendingUp, 
  Search, 
  Filter,
  ChevronRight,
  BarChart3,
  Plus
} from 'lucide-react';

interface CropPrediction {
  id: string;
  crop_type: string;
  field_area: number;
  predicted_yield: number;
  confidence_score: number;
  created_at: string;
}

const History = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<CropPrediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<CropPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (user) {
      fetchPredictions();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortPredictions();
  }, [predictions, searchTerm, cropFilter, sortBy]);

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('crop_predictions')
        .select('id, crop_type, field_area, predicted_yield, confidence_score, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPredictions = () => {
    let filtered = predictions.filter(prediction => {
      const matchesSearch = prediction.crop_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCrop = cropFilter === 'all' || prediction.crop_type === cropFilter;
      return matchesSearch && matchesCrop;
    });

    // Sort predictions
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'yield-high':
        filtered.sort((a, b) => b.predicted_yield - a.predicted_yield);
        break;
      case 'yield-low':
        filtered.sort((a, b) => a.predicted_yield - b.predicted_yield);
        break;
      case 'confidence':
        filtered.sort((a, b) => b.confidence_score - a.confidence_score);
        break;
    }

    setFilteredPredictions(filtered);
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) return { label: 'High', variant: 'default' as const };
    if (score >= 0.6) return { label: 'Medium', variant: 'secondary' as const };
    return { label: 'Low', variant: 'destructive' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const uniqueCrops = Array.from(new Set(predictions.map(p => p.crop_type)));

  const totalPredictions = predictions.length;
  const avgYield = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.predicted_yield, 0) / predictions.length 
    : 0;
  const avgConfidence = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prediction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
       <Header 
              pageName="History" 
              userName={user?.email?.split('@')[0] || 'User'} 
            />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Prediction History
              </h1>
              <p className="text-muted-foreground">
                View and analyze your past crop yield predictions
              </p>
            </div>
            
            <Link to="/prediction">
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                New Prediction
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="agricultural-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-primary">{totalPredictions}</p>
                    <p className="text-sm text-muted-foreground">Total Predictions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agricultural-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-success mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-success">{avgYield.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Avg. Yield (kg/ha)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agricultural-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-accent mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-accent">{(avgConfidence * 100).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="agricultural-card mb-6 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by crop type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={cropFilter} onValueChange={setCropFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {uniqueCrops.map(crop => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="yield-high">Highest Yield</SelectItem>
                  <SelectItem value="yield-low">Lowest Yield</SelectItem>
                  <SelectItem value="confidence">Confidence Score</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground flex items-center">
                Showing {filteredPredictions.length} of {totalPredictions} predictions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions List */}
        <div className="space-y-4 animate-slide-up">
          {filteredPredictions.length > 0 ? (
            filteredPredictions.map((prediction, index) => {
              const confidence = getConfidenceBadge(prediction.confidence_score);
              
              return (
                <Card key={prediction.id} className="agricultural-card hover:shadow-[var(--shadow-lg)] transition-[var(--transition-smooth)] cursor-pointer">
                  <Link to={`/prediction-result/${prediction.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-primary-light rounded-lg">
                            <Sprout className="h-6 w-6 text-primary" />
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {prediction.crop_type}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(prediction.created_at)}
                              </span>
                              <span className="flex items-center">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                {prediction.field_area} ha
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-success">
                              {prediction.predicted_yield.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">kg/ha</div>
                          </div>

                          <div className="text-right">
                            <Badge variant={confidence.variant} className="mb-1">
                              {confidence.label}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {(prediction.confidence_score * 100).toFixed(0)}% confidence
                            </div>
                          </div>

                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })
          ) : (
            <Card className="agricultural-card">
              <CardContent className="p-12 text-center">
                <Sprout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No predictions found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || cropFilter !== 'all' 
                    ? 'Try adjusting your filters to see more results.' 
                    : 'You haven\'t made any predictions yet. Create your first one to get started!'
                  }
                </p>
                <Link to="/prediction">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Prediction
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;