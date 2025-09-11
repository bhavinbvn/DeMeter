import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Activity, Thermometer, Droplets, Sprout, Calendar } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Device = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [device, setDevice] = useState<any>(null);
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && deviceId) {
      fetchDeviceDetails();
      fetchDeviceData();
    }
  }, [user, deviceId]);

  const fetchDeviceDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('*')
        .eq('id', deviceId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setDevice(data);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: "Failed to fetch device details",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  };

  const fetchDeviceData = async () => {
    try {
      const { data, error } = await supabase
        .from('device_data')
        .select('*')
        .eq('device_id', deviceId)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDeviceData(data || []);
    } catch (error: any) {
      console.error('Error fetching device data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDataIcon = (dataType: string) => {
    switch (dataType.toLowerCase()) {
      case 'temperature':
        return <Thermometer className="w-4 h-4" />;
      case 'humidity':
        return <Droplets className="w-4 h-4" />;
      case 'soil_moisture':
        return <Sprout className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-6 pt-24">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-6 pt-24">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-muted-foreground">Device not found</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6 pt-24">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            <h1 className="text-3xl font-bold text-gradient">{device.device_name}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device Info */}
            <Card className="agricultural-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  {t('device.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">{t('settings.deviceId')}</h4>
                  <p className="font-mono text-sm">{device.device_id}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">{t('settings.deviceType')}</h4>
                  <p className="capitalize">{device.device_type}</p>
                </div>

                {device.location && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Location</h4>
                    <p>{device.location}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">{t('device.status')}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      device.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className={device.is_active ? 'text-green-600' : 'text-red-600'}>
                      {device.is_active ? t('device.active') : t('device.inactive')}
                    </span>
                  </div>
                </div>

                {device.last_data_received && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">{t('device.lastUpdate')}</h4>
                    <p className="text-sm">{formatTimestamp(device.last_data_received)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest Data */}
            <Card className="lg:col-span-2 agricultural-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  {t('device.data')}
                </CardTitle>
                <CardDescription>
                  Recent sensor readings and measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deviceData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Latest values summary */}
                      {['temperature', 'humidity', 'soil_moisture'].map((type) => {
                        const latestData = deviceData.find((d: any) => d.data_type === type);
                        return latestData ? (
                          <div key={type} className="p-4 border rounded-lg agricultural-border">
                            <div className="flex items-center space-x-2 mb-1">
                              {getDataIcon(type)}
                              <h4 className="font-medium capitalize">{type.replace('_', ' ')}</h4>
                            </div>
                            <p className="text-2xl font-bold text-primary">
                              {formatValue(latestData.value, latestData.unit)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(latestData.timestamp)}
                            </p>
                          </div>
                        ) : null;
                      })}
                    </div>

                    {/* Data History */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Recent Readings</h4>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {deviceData.map((data: any) => (
                          <div
                            key={data.id}
                            className="flex items-center justify-between p-3 border rounded-lg agricultural-border"
                          >
                            <div className="flex items-center space-x-3">
                              {getDataIcon(data.data_type)}
                              <div>
                                <p className="font-medium capitalize">
                                  {data.data_type.replace('_', ' ')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatTimestamp(data.timestamp)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                {formatValue(data.value, data.unit)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {t('device.noData')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      No sensor data has been received from this device yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Device;