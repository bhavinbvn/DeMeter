import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthContext';
import Navigation from '@/components/Navigation';
import { ArrowRight, BarChart3, Brain, Leaf, TrendingUp, Users, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-agriculture.jpg';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms analyze your farm data to predict crop yields with high accuracy."
    },
    {
      icon: BarChart3,
      title: "Data Visualization",
      description: "Interactive charts and graphs help you understand trends and make informed decisions."
    },
    {
      icon: Leaf,
      title: "Sustainable Farming",
      description: "Get recommendations for eco-friendly practices that improve yield while protecting the environment."
    },
    {
      icon: TrendingUp,
      title: "Yield Optimization",
      description: "Receive personalized recommendations to maximize your crop yields and farm profitability."
    }
  ];

  const stats = [
    { label: "Farmers Helped", value: "10,000+", icon: Users },
    { label: "Predictions Made", value: "500K+", icon: BarChart3 },
    { label: "Yield Improvement", value: "25%", icon: TrendingUp },
    { label: "Accuracy Rate", value: "94%", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Modern farming with technology" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero opacity-80"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Optimize Your Crop Growth with
              <span className="block text-yellow-200">AI-Powered Insights</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
              Transform your farming with intelligent predictions, personalized recommendations, 
              and data-driven decisions that maximize your harvest potential.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="hero" size="xl" className="animate-float">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="hero" size="xl" className="animate-float">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="xl" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                      View Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-primary-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose Demeter?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with agricultural expertise 
              to help farmers make smarter decisions and increase productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="agricultural-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-light rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Revolutionize Your Farming?
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            Join thousands of farmers who are already using YieldSense to optimize their crops 
            and increase their profits. Start your free trial today.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="xl" className="bg-white text-primary hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="border-white/20 text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-gradient">Demeter</span>
            </div>
            <p className="text-muted-foreground mb-6">
              Empowering farmers with intelligent crop yield predictions and optimization.
            </p>
            <div className="text-sm text-muted-foreground">
              © 2025 Demeter. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
