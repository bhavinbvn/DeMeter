import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings2, Globe, Plus, Trash2, Smartphone } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Header } from '@/components/Header';
interface DeviceForm {
  device_id: string;
  device_name: string;
  device_type: string;
  location: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [devices, setDevices] = useState([]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<DeviceForm>();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
  ];

  useEffect(() => {
    if (user) {
      fetchDevices();
    }
  }, [user]);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSubmitDevice = async (data: DeviceForm) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('iot_devices')
        .insert({
          user_id: user.id,
          device_id: data.device_id,
          device_name: data.device_name,
          device_type: data.device_type,
          location: data.location,
        });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: "Device added successfully",
      });

      reset();
      setShowAddDevice(false);
      fetchDevices();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('iot_devices')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: "Device removed successfully",
      });

      fetchDevices();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    toast({
      title: t('common.success'),
      description: "Language changed successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
              pageName="Settings" 
              userName={user?.email?.split('@')[0] || 'User'} 
            />
      <div className="container mx-auto p-6 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center">
            <Settings2 className="w-8 h-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold text-gradient">{t('settings.title')}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Language Settings */}
            <Card className="agricultural-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-primary" />
                  {t('settings.language')}
                </CardTitle>
                <CardDescription>
                  Choose your preferred language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={i18n.language} onValueChange={changeLanguage}>
                  <SelectTrigger className="agricultural-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Device Management */}
            <Card className="agricultural-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="w-5 h-5 mr-2 text-primary" />
                    {t('settings.devices')}
                  </div>
                  <Button
                    onClick={() => setShowAddDevice(!showAddDevice)}
                    size="sm"
                    className="agricultural-button"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('settings.addDevice')}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage your IoT devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddDevice && (
                  <form onSubmit={handleSubmit(onSubmitDevice)} className="space-y-4 p-4 border rounded-lg agricultural-border">
                    <div className="space-y-2">
                      <Label htmlFor="device_id">{t('settings.deviceId')}</Label>
                      <Input
                        id="device_id"
                        {...register('device_id', { required: true })}
                        placeholder="SENSOR001"
                        className="agricultural-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="device_name">{t('settings.deviceName')}</Label>
                      <Input
                        id="device_name"
                        {...register('device_name', { required: true })}
                        placeholder="Soil Moisture Sensor"
                        className="agricultural-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="device_type">{t('settings.deviceType')}</Label>
                      <Select onValueChange={(value) => setValue('device_type', value)}>
                        <SelectTrigger className="agricultural-input">
                          <SelectValue placeholder="Select device type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sensor">{t('settings.sensor')}</SelectItem>
                          <SelectItem value="controller">{t('settings.controller')}</SelectItem>
                          <SelectItem value="monitor">{t('settings.monitor')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...register('location')}
                        placeholder="Field A, Sector 1"
                        className="agricultural-input"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={loading} className="agricultural-button">
                        {t('common.add')}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddDevice(false)}
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {devices.map((device: any) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-3 border rounded-lg agricultural-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{device.device_name}</h4>
                          <span className={`w-2 h-2 rounded-full ${
                            device.is_active ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID: {device.device_id} • Type: {device.device_type}
                        </p>
                        {device.location && (
                          <p className="text-sm text-muted-foreground">
                            Location: {device.location}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDevice(device.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {devices.length === 0 && !showAddDevice && (
                    <p className="text-muted-foreground text-center py-4">
                      No devices added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;