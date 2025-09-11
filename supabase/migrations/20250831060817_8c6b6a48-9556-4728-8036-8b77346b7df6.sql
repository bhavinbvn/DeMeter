-- Create IoT devices table
CREATE TABLE public.iot_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id TEXT NOT NULL UNIQUE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'sensor',
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_data_received TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;

-- Create policies for IoT devices
CREATE POLICY "Users can view their own devices" 
ON public.iot_devices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own devices" 
ON public.iot_devices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" 
ON public.iot_devices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" 
ON public.iot_devices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create device data table for storing sensor readings
CREATE TABLE public.device_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.iot_devices(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- temperature, humidity, soil_moisture, etc.
  value NUMERIC NOT NULL,
  unit TEXT, -- celsius, percentage, etc.
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.device_data ENABLE ROW LEVEL SECURITY;

-- Create policy for device data (users can only see data from their devices)
CREATE POLICY "Users can view data from their devices" 
ON public.device_data 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.iot_devices 
  WHERE public.iot_devices.id = public.device_data.device_id 
  AND public.iot_devices.user_id = auth.uid()
));

-- Create trigger for IoT devices timestamps
CREATE TRIGGER update_iot_devices_updated_at
  BEFORE UPDATE ON public.iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_device_data_device_timestamp ON public.device_data(device_id, timestamp DESC);
CREATE INDEX idx_iot_devices_user_id ON public.iot_devices(user_id);