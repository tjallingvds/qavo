import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Mail, 
  Calendar,
  ArrowUpRight,
  Activity,
  Clock,
  CheckCircle,
  Plus,
  MoreHorizontal,
  Lightbulb,
  Target,
  Zap,
  BarChart3,
  Brain,
  Sparkles
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-500'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{change}</span>
        </div>
      </div>
      
      <div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'purple' | 'green' | 'orange';
  onClick?: () => void;
}

function QuickAction({ title, description, icon: Icon, color, onClick }: QuickActionProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-6 bg-gradient-to-r ${colorClasses[color]} text-white rounded-xl hover:scale-[1.02] transition-all duration-300 shadow-lg group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <Icon className="h-6 w-6" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-white/90 leading-relaxed">{description}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
      </div>
    </button>
  );
}

interface ActivityItemProps {
  type: 'email' | 'chat' | 'meeting' | 'task';
  title: string;
  description: string;
  time: string;
  user?: string;
}

function ActivityItem({ type, title, description, time, user }: ActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'chat': return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'meeting': return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'task': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'email': return 'bg-blue-50';
      case 'chat': return 'bg-green-50';
      case 'meeting': return 'bg-purple-50';
      case 'task': return 'bg-emerald-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50/50 rounded-lg transition-colors duration-200">
      <div className={`flex-shrink-0 p-2 ${getBgColor()} rounded-lg`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
        {user && <p className="text-xs text-gray-500 mt-1">by {user}</p>}
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">{time}</span>
    </div>
  );
}

interface InsightItemProps {
  title: string;
  description: string;
  progress?: number;
  type: 'suggestion' | 'alert' | 'insight';
}

function InsightItem({ title, description, progress, type }: InsightItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="h-5 w-5 text-amber-600" />;
      case 'alert': return <Zap className="h-5 w-5 text-red-500" />;
      case 'insight': return <Target className="h-5 w-5 text-blue-600" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'suggestion': return 'from-amber-50 to-yellow-50';
      case 'alert': return 'from-red-50 to-pink-50';
      case 'insight': return 'from-blue-50 to-indigo-50';
      default: return 'from-gray-50 to-gray-100';
    }
  };

  return (
    <div className={`p-5 bg-gradient-to-br ${getBgColor()} rounded-xl border border-white/50`}>
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>
          <p className="text-xs text-gray-700 leading-relaxed">{description}</p>
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="text-gray-800 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-white/60 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const metrics = [
    {
      title: 'Active Users',
      value: '2,847',
      change: '+12%',
      trend: 'up' as const,
      icon: Users
    },
    {
      title: 'Messages Sent',
      value: '18,249',
      change: '+8%',
      trend: 'up' as const,
      icon: MessageSquare
    },
    {
      title: 'Emails Processed',
      value: '4,823',
      change: '-3%',
      trend: 'down' as const,
      icon: Mail
    },
    {
      title: 'Response Rate',
      value: '94.2%',
      change: '+5%',
      trend: 'up' as const,
      icon: BarChart3
    }
  ];

  const quickActions = [
    {
      title: 'Schedule Meeting',
      description: 'Set up a new team meeting or one-on-one session',
      icon: Calendar,
      color: 'blue' as const
    },
    {
      title: 'Send Announcement',
      description: 'Broadcast important updates to your team',
      icon: MessageSquare,
      color: 'purple' as const
    },
    {
      title: 'Review Analytics',
      description: 'Check detailed performance metrics and insights',
      icon: BarChart3,
      color: 'green' as const
    },
    {
      title: 'Manage Users',
      description: 'Add or remove team members and permissions',
      icon: Users,
      color: 'orange' as const
    }
  ];

  const recentActivity = [
    {
      type: 'email' as const,
      title: 'New email from Sarah Chen',
      description: 'Q4 Marketing Strategy Review',
      time: '2 min ago',
      user: 'Sarah Chen'
    },
    {
      type: 'chat' as const,
      title: 'Message in #general',
      description: 'Design system updates shared',
      time: '5 min ago',
      user: 'Alice Johnson'
    },
    {
      type: 'task' as const,
      title: 'Task completed',
      description: 'Project timeline updated successfully',
      time: '12 min ago',
      user: 'Bob Smith'
    },
    {
      type: 'meeting' as const,
      title: 'Meeting ended',
      description: 'Weekly team sync (45 minutes)',
      time: '1 hour ago'
    }
  ];

  const insights = [
    {
      title: 'Email Response Time',
      description: 'Your average response time has improved by 23% this week. Keep up the great work!',
      progress: 78,
      type: 'insight' as const
    },
    {
      title: 'Peak Activity Hours',
      description: 'Most team communication happens between 10 AM - 2 PM. Consider scheduling important meetings during this time.',
      type: 'suggestion' as const
    },
    {
      title: 'Unread Messages',
      description: 'You have 12 unread messages that may need attention. Review them when you have a moment.',
      type: 'alert' as const
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your workspace.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Recent Activity</span>
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                View all
              </button>
            </div>
            <div className="space-y-1">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>AI Insights</span>
              </h2>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                See more
              </button>
            </div>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <InsightItem key={index} {...insight} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 