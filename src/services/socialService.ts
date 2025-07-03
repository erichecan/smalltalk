import { supabase } from './supabase';
import { pointsService } from './pointsService';

// 社交系统接口定义
export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  location?: string;
  website?: string;
  learning_goals?: string[];
  interests?: string[];
  preferred_language: string;
  timezone: string;
  is_public: boolean;
  show_progress: boolean;
  show_achievements: boolean;
  allow_friend_requests: boolean;
  created_at: string;
  updated_at: string;
}

export interface FriendWithProfile {
  friendship: Friendship;
  profile: UserProfile;
  stats?: {
    level: number;
    total_points: number;
    last_active: string;
    is_online: boolean;
  };
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  post_type: 'general' | 'achievement' | 'question' | 'tip' | 'milestone';
  media_urls: string[];
  tags: string[];
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  author_profile?: UserProfile;
  is_liked?: boolean;
}

export interface PostInteraction {
  id: string;
  post_id: string;
  user_id: string;
  interaction_type: 'like' | 'comment' | 'share' | 'report';
  content?: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  author_profile?: UserProfile;
}

class SocialService {
  // ============================================
  // 用户资料管理
  // ============================================

  /**
   * 获取用户资料
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * 创建或更新用户资料
   */
  async upsertUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert([{
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  }

  /**
   * 搜索用户
   */
  async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_public', true)
        .eq('allow_friend_requests', true)
        .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // ============================================
  // 好友管理
  // ============================================

  /**
   * 发送好友请求
   */
  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    try {
      // 检查是否已存在好友关系
      const existingFriendship = await this.getFriendshipStatus(requesterId, addresseeId);
      if (existingFriendship) {
        throw new Error('Friendship already exists');
      }

      // 检查目标用户是否允许好友请求
      const addresseeProfile = await this.getUserProfile(addresseeId);
      if (!addresseeProfile?.allow_friend_requests) {
        throw new Error('User does not accept friend requests');
      }

      // 创建好友请求
      const { data, error } = await supabase
        .from('friendships')
        .insert([{
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // 创建通知
      await this.createNotification(
        addresseeId,
        'friend_request',
        'New Friend Request',
        'Someone wants to be your friend!',
        { requester_id: requesterId }
      );

      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * 接受好友请求
   */
  async acceptFriendRequest(friendshipId: string, userId: string): Promise<Friendship> {
    try {
      // 验证用户权限
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('*')
        .eq('id', friendshipId)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .single();

      if (fetchError || !friendship) {
        throw new Error('Friend request not found or not authorized');
      }

      // 更新好友关系状态
      const { data, error } = await supabase
        .from('friendships')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;

      // 奖励积分
      await pointsService.awardPoints(
        userId,
        'FRIEND_INVITE' as any,
        25,
        friendshipId,
        'New friend added'
      );

      await pointsService.awardPoints(
        friendship.requester_id,
        'FRIEND_INVITE' as any,
        25,
        friendshipId,
        'Friend request accepted'
      );

      // 创建通知
      await this.createNotification(
        friendship.requester_id,
        'friend_accepted',
        'Friend Request Accepted',
        'Your friend request was accepted!',
        { accepter_id: userId }
      );

      return data;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  /**
   * 拒绝好友请求
   */
  async declineFriendRequest(friendshipId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', friendshipId)
        .eq('addressee_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    }
  }

  /**
   * 删除好友关系
   */
  async removeFriend(friendshipId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  /**
   * 获取好友列表
   */
  async getFriends(userId: string): Promise<FriendWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester_profile:user_profiles!friendships_requester_id_fkey(*),
          addressee_profile:user_profiles!friendships_addressee_id_fkey(*)
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const friends: FriendWithProfile[] = [];
      
      for (const friendship of data || []) {
        const isRequester = friendship.requester_id === userId;
        const friendProfile = isRequester ? friendship.addressee_profile : friendship.requester_profile;
        const friendId = isRequester ? friendship.addressee_id : friendship.requester_id;

        if (friendProfile) {
          // 获取好友的学习统计
          const stats = await pointsService.getUserStats(friendId);
          
          friends.push({
            friendship,
            profile: friendProfile,
            stats: stats ? {
              level: stats.level,
              total_points: stats.total_points,
              last_active: stats.updated_at,
              is_online: false // TODO: 实现在线状态检测
            } : undefined
          });
        }
      }

      return friends;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }

  /**
   * 获取好友请求
   */
  async getFriendRequests(userId: string, type: 'received' | 'sent' = 'received'): Promise<FriendWithProfile[]> {
    try {
      const column = type === 'received' ? 'addressee_id' : 'requester_id';
      const profileColumn = type === 'received' ? 'requester_profile' : 'addressee_profile';
      const profileRef = type === 'received' ? 'friendships_requester_id_fkey' : 'friendships_addressee_id_fkey';

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          ${profileColumn}:user_profiles!${profileRef}(*)
        `)
        .eq(column, userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(friendship => ({
        friendship,
        profile: friendship[profileColumn],
        stats: undefined // 请求阶段不需要详细统计
      }));
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      throw error;
    }
  }

  /**
   * 获取好友关系状态
   */
  async getFriendshipStatus(userId1: string, userId2: string): Promise<Friendship | null> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${userId1},addressee_id.eq.${userId2}),and(requester_id.eq.${userId2},addressee_id.eq.${userId1})`)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error checking friendship status:', error);
      return null;
    }
  }

  // ============================================
  // 社区功能
  // ============================================

  /**
   * 创建帖子
   */
  async createPost(
    userId: string,
    content: string,
    postType: CommunityPost['post_type'] = 'general',
    title?: string,
    tags: string[] = [],
    isPublic: boolean = true
  ): Promise<CommunityPost> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: userId,
          title,
          content,
          post_type: postType,
          tags,
          is_public: isPublic,
          media_urls: []
        }])
        .select()
        .single();

      if (error) throw error;

      // 奖励发帖积分
      await pointsService.awardPoints(
        userId,
        'CONVERSATION' as any, // 使用对话积分类型作为临时方案
        5,
        data.id,
        'Posted in community'
      );

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * 获取社区帖子
   */
  async getPosts(
    limit: number = 20,
    offset: number = 0,
    postType?: CommunityPost['post_type'],
    userId?: string
  ): Promise<CommunityPost[]> {
    try {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          author_profile:user_profiles!community_posts_user_id_fkey(*)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (postType) {
        query = query.eq('post_type', postType);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  /**
   * 点赞帖子
   */
  async likePost(userId: string, postId: string): Promise<PostInteraction> {
    try {
      // 检查是否已经点赞
      const existingLike = await this.getPostInteraction(userId, postId, 'like');
      if (existingLike) {
        throw new Error('Post already liked');
      }

      const { data, error } = await supabase
        .from('post_interactions')
        .insert([{
          user_id: userId,
          post_id: postId,
          interaction_type: 'like'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  /**
   * 取消点赞
   */
  async unlikePost(userId: string, postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('post_interactions')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('interaction_type', 'like');

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  /**
   * 评论帖子
   */
  async commentPost(
    userId: string,
    postId: string,
    content: string,
    parentCommentId?: string
  ): Promise<PostInteraction> {
    try {
      const { data, error } = await supabase
        .from('post_interactions')
        .insert([{
          user_id: userId,
          post_id: postId,
          interaction_type: 'comment',
          content,
          parent_comment_id: parentCommentId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error commenting on post:', error);
      throw error;
    }
  }

  /**
   * 获取帖子互动
   */
  async getPostInteractions(
    postId: string,
    interactionType?: PostInteraction['interaction_type']
  ): Promise<PostInteraction[]> {
    try {
      let query = supabase
        .from('post_interactions')
        .select(`
          *,
          author_profile:user_profiles!post_interactions_user_id_fkey(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (interactionType) {
        query = query.eq('interaction_type', interactionType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching post interactions:', error);
      throw error;
    }
  }

  /**
   * 获取用户对帖子的特定互动
   */
  async getPostInteraction(
    userId: string,
    postId: string,
    interactionType: PostInteraction['interaction_type']
  ): Promise<PostInteraction | null> {
    try {
      const { data, error } = await supabase
        .from('post_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('interaction_type', interactionType)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user post interaction:', error);
      return null;
    }
  }

  // ============================================
  // 通知系统
  // ============================================

  /**
   * 创建通知
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type,
          title,
          message,
          data: data || {}
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * 获取用户通知
   */
  async getNotifications(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * 标记通知为已读
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
}

export const socialService = new SocialService();