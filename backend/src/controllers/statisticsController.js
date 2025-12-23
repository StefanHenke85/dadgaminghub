import { supabase } from '../config/supabase.js';

export const getUserStatistics = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user profile with stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_sessions, total_playtime, favorite_game')
      .eq('id', userId)
      .single();

    // Get hosted sessions count
    const { count: hostedCount } = await supabase
      .from('gaming_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', userId);

    // Get night sessions (after 22:00)
    const { data: allSessions } = await supabase
      .from('gaming_sessions')
      .select('scheduled_for')
      .contains('participants', [userId]);

    const nightSessions = allSessions?.filter(session => {
      const hour = new Date(session.scheduled_for).getHours();
      return hour >= 22 || hour < 6;
    }).length || 0;

    // Get top games for this user
    const { data: userSessions } = await supabase
      .from('gaming_sessions')
      .select('game')
      .contains('participants', [userId]);

    // Count games
    const gameCounts = {};
    userSessions?.forEach(session => {
      gameCounts[session.game] = (gameCounts[session.game] || 0) + 1;
    });

    // Sort and get top 3
    const topGames = Object.entries(gameCounts)
      .map(([game, count]) => ({ game, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Get favorite platform
    const { data: platformSessions } = await supabase
      .from('gaming_sessions')
      .select('platform')
      .contains('participants', [userId]);

    const platformCounts = {};
    platformSessions?.forEach(session => {
      platformCounts[session.platform] = (platformCounts[session.platform] || 0) + 1;
    });

    const favoritePlatform = Object.entries(platformCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    res.json({
      totalSessions: profile?.total_sessions || 0,
      hostedSessions: hostedCount || 0,
      totalPlaytime: profile?.total_playtime || 0,
      favoriteGame: profile?.favorite_game,
      favoritePlatform,
      nightSessions,
      topGames
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    // Top Hosts (most hosted sessions)
    const { data: topHosts } = await supabase
      .from('gaming_sessions')
      .select('host_id')
      .order('created_at', { ascending: false });

    // Count sessions per host
    const hostCounts = {};
    topHosts?.forEach(session => {
      hostCounts[session.host_id] = (hostCounts[session.host_id] || 0) + 1;
    });

    // Get top 10 hosts with profile data
    const topHostIds = Object.entries(hostCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ id, hosted_sessions: count }));

    const hostsWithProfiles = await Promise.all(
      topHostIds.map(async (host) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, username, avatar')
          .eq('id', host.id)
          .single();

        return {
          ...profile,
          hosted_sessions: host.hosted_sessions
        };
      })
    );

    // Top Players (most total sessions from profile)
    const { data: topPlayers } = await supabase
      .from('profiles')
      .select('id, name, username, avatar, total_sessions')
      .order('total_sessions', { ascending: false })
      .limit(10);

    res.json({
      hosts: hostsWithProfiles.filter(h => h),
      players: topPlayers || []
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Leaderboards' });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all user sessions with platform
    const { data: sessions } = await supabase
      .from('gaming_sessions')
      .select('platform')
      .contains('participants', [userId]);

    // Count by platform
    const platformCounts = {};
    sessions?.forEach(session => {
      platformCounts[session.platform] = (platformCounts[session.platform] || 0) + 1;
    });

    // Convert to array and sort
    const platformStats = Object.entries(platformCounts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);

    res.json(platformStats);
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Plattform-Statistiken' });
  }
};
