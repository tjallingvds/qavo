import React from 'react';
import { Mail, ArrowRight, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthPromptProps {
  onAuthenticate: () => void;
  isLoading?: boolean;
  error?: string;
}

export function AuthPrompt({ onAuthenticate, isLoading, error }: AuthPromptProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Gmail Account
          </h1>
          <p className="text-gray-600 mb-6">
            Connect your Gmail account to view and manage your emails directly in the app.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
            <span>Secure OAuth 2.0 authentication</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Zap className="h-4 w-4 text-yellow-500 mr-3 flex-shrink-0" />
            <span>Read-only access to your emails</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
            <span>Manage labels and send messages</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button 
          onClick={onAuthenticate}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span>Connect Gmail</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          By connecting, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
} 