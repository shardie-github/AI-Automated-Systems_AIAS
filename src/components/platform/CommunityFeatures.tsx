/**
 * Community Features UI
 * Forums, expert profiles, social features, and gamification
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Users, 
  Star, 
  Heart, 
  Share2, 
  Bookmark, 
  Search, 
  Filter,
  Plus,
  TrendingUp,
  Award,
  Trophy,
  Target,
  Zap,
  Globe,
  Calendar,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Flag,
  MoreVertical,
  Edit,
  Trash2,
  Pin,
  Eye,
  MessageCircle,
  UserPlus,
  CheckCircle,
  Crown,
  Flame,
  Sparkles
} from 'lucide-react';
import { CommunityPost, ExpertProfile } from '@/types/platform';

interface CommunityFeaturesProps {
  userId: string;
  tenantId?: string;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  lastPost?: {
    title: string;
    author: string;
    date: Date;
  };
}

interface GamificationStats {
  level: number;
  xp: number;
  xpToNext: number;
  badges: Badge[];
  achievements: Achievement[];
  rank: number;
  streak: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: string;
  completed: boolean;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
    title: string;
  };
  xp: number;
  level: number;
  badges: number;
}

export const CommunityFeatures: React.FC<CommunityFeaturesProps> = ({
  userId,
  tenantId
}) => {
  const [activeTab, setActiveTab] = useState('forums');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Load initial data
  useEffect(() => {
    loadCommunityData();
  }, [userId, tenantId]);

  const loadCommunityData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          author: {
            id: 'user1',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            verified: true
          },
          title: 'Best Practices for AI Workflow Optimization',
          content: 'I\'ve been working with AI workflows for over 2 years and wanted to share some key insights...',
          type: 'tip',
          tags: ['ai', 'workflows', 'optimization', 'best-practices'],
          likes: 42,
          comments: 8,
          views: 156,
          featured: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: '2',
          author: {
            id: 'user2',
            name: 'Mike Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            verified: false
          },
          title: 'How to integrate Slack with custom workflows?',
          content: 'I\'m trying to set up a workflow that sends notifications to Slack when certain conditions are met...',
          type: 'question',
          tags: ['slack', 'integration', 'workflows', 'help'],
          likes: 15,
          comments: 12,
          views: 89,
          featured: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
        },
        {
          id: '3',
          author: {
            id: 'user3',
            name: 'Alex Johnson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            verified: true
          },
          title: 'Showcase: Automated Lead Scoring System',
          content: 'Check out this automated lead scoring system I built using AIAS platform...',
          type: 'showcase',
          tags: ['showcase', 'lead-scoring', 'automation', 'ai'],
          likes: 67,
          comments: 15,
          views: 234,
          featured: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
        }
      ];

      const mockExperts: ExpertProfile[] = [
        {
          id: 'expert1',
          name: 'Dr. Emily Watson',
          title: 'AI Research Scientist',
          company: 'TechCorp AI',
          bio: 'Leading AI researcher with 10+ years in machine learning and automation. Specialized in workflow optimization and neural networks.',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          expertise: ['Machine Learning', 'Neural Networks', 'Workflow Optimization', 'Python', 'TensorFlow'],
          certifications: ['AWS ML Specialty', 'Google Cloud AI', 'Microsoft Azure AI'],
          rating: 4.9,
          projects: 156,
          followers: 2847,
          verified: true,
          availability: 'available',
          hourlyRate: 200,
          currency: 'USD'
        },
        {
          id: 'expert2',
          name: 'James Liu',
          title: 'Senior Automation Engineer',
          company: 'AutoFlow Inc',
          bio: 'Expert in enterprise automation solutions and workflow design. Helped 500+ companies optimize their processes.',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
          expertise: ['Enterprise Automation', 'Process Optimization', 'Zapier', 'Microsoft Power Automate', 'RPA'],
          certifications: ['UiPath RPA Developer', 'Blue Prism Developer', 'Pega Certified'],
          rating: 4.8,
          projects: 89,
          followers: 1923,
          verified: true,
          availability: 'busy',
          hourlyRate: 150,
          currency: 'USD'
        }
      ];

      const mockCategories: ForumCategory[] = [
        {
          id: 'general',
          name: 'General Discussion',
          description: 'General questions and discussions about AIAS platform',
          icon: '💬',
          postCount: 156,
          lastPost: {
            title: 'Welcome to the community!',
            author: 'Admin',
            date: new Date(Date.now() - 1000 * 60 * 15)
          }
        },
        {
          id: 'workflows',
          name: 'Workflows & Automation',
          description: 'Share and discuss workflow designs and automation strategies',
          icon: '⚡',
          postCount: 89,
          lastPost: {
            title: 'Complex workflow debugging tips',
            author: 'Sarah Chen',
            date: new Date(Date.now() - 1000 * 60 * 45)
          }
        },
        {
          id: 'integrations',
          name: 'Integrations',
          description: 'Integration guides, tips, and troubleshooting',
          icon: '🔗',
          postCount: 67,
          lastPost: {
            title: 'Slack integration best practices',
            author: 'Mike Rodriguez',
            date: new Date(Date.now() - 1000 * 60 * 60)
          }
        },
        {
          id: 'showcase',
          name: 'Showcase',
          description: 'Show off your amazing automation creations',
          icon: '🎨',
          postCount: 34,
          lastPost: {
            title: 'Automated lead scoring system',
            author: 'Alex Johnson',
            date: new Date(Date.now() - 1000 * 60 * 60 * 2)
          }
        }
      ];

      const mockGamificationStats: GamificationStats = {
        level: 12,
        xp: 2450,
        xpToNext: 550,
        badges: [
          {
            id: '1',
            name: 'First Post',
            description: 'Made your first community post',
            icon: '📝',
            rarity: 'common',
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
          },
          {
            id: '2',
            name: 'Helper',
            description: 'Helped 10 community members',
            icon: '🤝',
            rarity: 'rare',
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
          },
          {
            id: '3',
            name: 'Expert',
            description: 'Reached level 10',
            icon: '⭐',
            rarity: 'epic',
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
          }
        ],
        achievements: [
          {
            id: '1',
            name: 'Community Champion',
            description: 'Get 100 likes on your posts',
            progress: 67,
            maxProgress: 100,
            reward: '500 XP',
            completed: false
          },
          {
            id: '2',
            name: 'Knowledge Sharer',
            description: 'Post 25 helpful tips',
            progress: 18,
            maxProgress: 25,
            reward: '250 XP',
            completed: false
          },
          {
            id: '3',
            name: 'Social Butterfly',
            description: 'Comment on 50 posts',
            progress: 50,
            maxProgress: 50,
            reward: '100 XP',
            completed: true
          }
        ],
        rank: 15,
        streak: 7
      };

      const mockLeaderboard: LeaderboardEntry[] = [
        {
          rank: 1,
          user: {
            id: 'leader1',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            title: 'AI Expert'
          },
          xp: 15420,
          level: 25,
          badges: 12
        },
        {
          rank: 2,
          user: {
            id: 'leader2',
            name: 'Mike Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            title: 'Automation Guru'
          },
          xp: 12890,
          level: 22,
          badges: 9
        },
        {
          rank: 3,
          user: {
            id: 'leader3',
            name: 'Alex Johnson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            title: 'Workflow Master'
          },
          xp: 11200,
          level: 20,
          badges: 8
        }
      ];

      setPosts(mockPosts);
      setExperts(mockExperts);
      setCategories(mockCategories);
      setGamificationStats(mockGamificationStats);
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Failed to load community data:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'tip': return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'showcase': return <Sparkles className="h-4 w-4 text-purple-600" />;
      case 'announcement': return <Pin className="h-4 w-4 text-red-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'tip': return 'bg-yellow-100 text-yellow-800';
      case 'showcase': return 'bg-purple-100 text-purple-800';
      case 'announcement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      post.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.likes - a.likes;
      case 'trending':
        return (b.likes + b.comments + b.views) - (a.likes + a.comments + a.views);
      default:
        return 0;
    }
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600">Connect, learn, and grow with the AIAS community</p>
        </div>
        <div className="flex items-center gap-3">
          {gamificationStats && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg">
              <Trophy className="h-5 w-5" />
              <div>
                <div className="text-sm font-medium">Level {gamificationStats.level}</div>
                <div className="text-xs opacity-90">
                  {gamificationStats.xp} XP • Rank #{gamificationStats.rank}
                </div>
              </div>
            </div>
          )}
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forums">Forums</TabsTrigger>
          <TabsTrigger value="experts">Experts</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        {/* Forums Tab */}
        <TabsContent value="forums" className="space-y-6">
          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(category => (
              <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.postCount} posts</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                  {category.lastPost && (
                    <div className="text-xs text-gray-400">
                      Last: {category.lastPost.title} by {category.lastPost.author}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts, tags, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="workflows">Workflows</SelectItem>
                <SelectItem value="integrations">Integrations</SelectItem>
                <SelectItem value="ai">AI & ML</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {sortedPosts.map(post => (
              <Card key={post.id} className={`transition-all hover:shadow-md ${post.featured ? 'border-l-4 border-l-yellow-500 bg-yellow-50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
                            {post.title}
                          </h3>
                          {post.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Pin className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge className={getPostTypeColor(post.type)}>
                            {getPostTypeIcon(post.type)}
                            <span className="ml-1 capitalize">{post.type}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600">by</span>
                        <span className="text-sm font-medium">{post.author.name}</span>
                        {post.author.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">{post.content}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-4 w-4" />
                              <span className="ml-1">{post.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Reply className="h-4 w-4" />
                              <span className="ml-1">{post.comments}</span>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{post.views}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Experts Tab */}
        <TabsContent value="experts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map(expert => (
              <Card key={expert.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Avatar className="h-20 w-20 mx-auto mb-3">
                      <AvatarImage src={expert.avatar} />
                      <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">{expert.name}</h3>
                    <p className="text-gray-600">{expert.title}</p>
                    <p className="text-sm text-gray-500">{expert.company}</p>
                    {expert.verified && (
                      <Badge className="mt-2 bg-blue-100 text-blue-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Expert
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">{expert.bio}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{expert.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Projects</span>
                      <span className="font-medium">{expert.projects}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Followers</span>
                      <span className="font-medium">{expert.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rate</span>
                      <span className="font-medium">${expert.hourlyRate}/hr</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Expertise</h4>
                    <div className="flex flex-wrap gap-1">
                      {expert.expertise.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {expert.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{expert.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button className="flex-1" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Community Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div key={entry.user.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold">
                      {entry.rank}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={entry.user.avatar} />
                      <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{entry.user.name}</h3>
                      <p className="text-sm text-gray-600">{entry.user.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.xp.toLocaleString()} XP</div>
                      <div className="text-sm text-gray-600">Level {entry.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.badges} Badges</div>
                      <div className="text-sm text-gray-600">Achievements</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {gamificationStats && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{gamificationStats.level}</div>
                    <div className="text-sm text-gray-600">Level</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{gamificationStats.xp}</div>
                    <div className="text-sm text-gray-600">XP</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{gamificationStats.badges.length}</div>
                    <div className="text-sm text-gray-600">Badges</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{gamificationStats.streak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </CardContent>
                </Card>
              </div>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Your Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gamificationStats.badges.map(badge => (
                      <div key={badge.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <span className={`text-2xl ${getRarityColor(badge.rarity)}`}>
                          {badge.icon}
                        </span>
                        <div>
                          <h4 className="font-semibold">{badge.name}</h4>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                          <p className="text-xs text-gray-500">
                            Earned {new Date(badge.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gamificationStats.achievements.map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {achievement.completed ? (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          ) : (
                            <div className="h-8 w-8 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            {achievement.reward}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Knowledge Base</h3>
            <p className="text-gray-600 mb-6">Comprehensive guides, tutorials, and documentation</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Browse Knowledge Base
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityFeatures;