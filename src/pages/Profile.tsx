import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, MapPin, Phone, Edit3, Save, Smartphone } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Header } from '@/components/Header';
interface ProfileData {
  full_name: string;
  farm_name: string;
  location: string;
  phone_number: string;
  primary_crops: string[];
  farm_size: number;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);

  const { register, handleSubmit, setValue, watch } = useForm<ProfileData>();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchDevices();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setValue('full_name', data.full_name || '');
        setValue('farm_name', data.farm_name || '');
        setValue('location', data.location || '');
        setValue('phone_number', data.phone_number || '');
        setValue('primary_crops', data.primary_crops || []);
        setValue('farm_size', data.farm_size || 0);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive",
      });
    }
  };

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('iot_devices')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setDevices(data || []);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
    }
  };

  const onSubmit = async (data: ProfileData) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: data.full_name,
          farm_name: data.farm_name,
          location: data.location,
          phone_number: data.phone_number,
          primary_crops: Array.isArray(data.primary_crops) 
            ? data.primary_crops 
            : typeof data.primary_crops === 'string' 
              ? data.primary_crops.split(',').map(crop => crop.trim()) 
              : [],
          farm_size: Number(data.farm_size),
        });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: "Profile updated successfully",
      });
      setIsEditing(false);
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

  const formData = watch();

  return (
    <div className="min-h-screen bg-background">
       <Header 
              pageName="Profile" 
              userName={user?.email?.split('@')[0] || 'User'} 
            />
      <div className="container mx-auto p-6 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">{t('profile.title')}</h1>
            <Button
              onClick={() => isEditing ? handleSubmit(onSubmit)() : setIsEditing(true)}
              disabled={loading}
              className="agricultural-button"
            >
              {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
              {isEditing ? t('profile.save') : t('profile.editProfile')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="agricultural-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  {t('profile.personalInfo')}
                </CardTitle>
                <CardDescription>
                  Manage your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('auth.fullName')}</Label>
                  <Input
                    id="full_name"
                    {...register('full_name')}
                    disabled={!isEditing}
                    className="agricultural-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {t('auth.location')}
                  </Label>
                  <Input
                    id="location"
                    {...register('location')}
                    disabled={!isEditing}
                    className="agricultural-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {t('auth.phoneNumber')}
                  </Label>
                  <Input
                    id="phone_number"
                    {...register('phone_number')}
                    disabled={!isEditing}
                    className="agricultural-input"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Farm Details */}
            <Card className="agricultural-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-primary" />
                  {t('profile.farmDetails')}
                </CardTitle>
                <CardDescription>
                  Information about your farming operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="farm_name">{t('auth.farmName')}</Label>
                  <Input
                    id="farm_name"
                    {...register('farm_name')}
                    disabled={!isEditing}
                    className="agricultural-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_crops">{t('auth.primaryCrops')}</Label>
                  <Input
                    id="primary_crops"
                    {...register('primary_crops')}
                    disabled={!isEditing}
                    placeholder="Rice, Wheat, Cotton (comma separated)"
                    className="agricultural-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farm_size">{t('auth.farmSize')}</Label>
                  <Input
                    id="farm_size"
                    type="number"
                    step="0.1"
                    {...register('farm_size')}
                    disabled={!isEditing}
                    className="agricultural-input"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connected Devices */}
          <Card className="agricultural-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-primary" />
                {t('profile.connectedDevices')}
              </CardTitle>
              <CardDescription>
                IoT devices connected to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {devices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {devices.map((device: any) => (
                    <div
                      key={device.id}
                      className="border rounded-lg p-4 agricultural-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{device.device_name}</h4>
                        <span className={`w-3 h-3 rounded-full ${
                          device.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        ID: {device.device_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Type: {device.device_type}
                      </p>
                      {device.location && (
                        <p className="text-sm text-muted-foreground">
                          Location: {device.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t('profile.noDevices')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;