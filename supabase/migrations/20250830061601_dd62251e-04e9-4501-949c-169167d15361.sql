-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  farm_name TEXT,
  location TEXT,
  phone_number TEXT,
  farm_size DECIMAL,
  primary_crops TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crop_predictions table
CREATE TABLE public.crop_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  field_area DECIMAL NOT NULL,
  soil_ph DECIMAL,
  soil_moisture DECIMAL,
  nitrogen_level DECIMAL,
  phosphorus_level DECIMAL,
  potassium_level DECIMAL,
  temperature DECIMAL,
  rainfall DECIMAL,
  humidity DECIMAL,
  irrigation_method TEXT,
  fertilizer_used TEXT,
  predicted_yield DECIMAL,
  confidence_score DECIMAL,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES public.crop_predictions(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'irrigation', 'fertilizer', 'pest_control', 'general'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  implementation_cost DECIMAL,
  expected_impact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for crop_predictions
CREATE POLICY "Users can view their own predictions" 
ON public.crop_predictions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own predictions" 
ON public.crop_predictions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions" 
ON public.crop_predictions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions" 
ON public.crop_predictions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for recommendations
CREATE POLICY "Users can view recommendations for their predictions" 
ON public.recommendations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.crop_predictions 
    WHERE crop_predictions.id = recommendations.prediction_id 
    AND crop_predictions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create recommendations for their predictions" 
ON public.recommendations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.crop_predictions 
    WHERE crop_predictions.id = recommendations.prediction_id 
    AND crop_predictions.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crop_predictions_updated_at
  BEFORE UPDATE ON public.crop_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_crop_predictions_user_id ON public.crop_predictions(user_id);
CREATE INDEX idx_crop_predictions_created_at ON public.crop_predictions(created_at DESC);
CREATE INDEX idx_recommendations_prediction_id ON public.recommendations(prediction_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);