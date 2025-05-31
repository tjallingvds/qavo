import React from 'react';
import { MessageSquare, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SlackAuthPromptProps {
  onAuthenticate: () => void;
  isLoading?: boolean;
  error?: string;
}

export function SlackAuthPrompt({ onAuthenticate, isLoading, error }: SlackAuthPromptProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Slack Workspace
          </h1>
          <p className="text-gray-600 mb-6">
            Connect your Slack workspace to view channels, send messages, and stay connected with your team.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
            <span>Secure OAuth 2.0 authentication</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
            <span>Access to channels and direct messages</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Zap className="h-4 w-4 text-yellow-500 mr-3 flex-shrink-0" />
            <span>Send and receive messages in real-time</span>
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
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span>Connect Slack</span>
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