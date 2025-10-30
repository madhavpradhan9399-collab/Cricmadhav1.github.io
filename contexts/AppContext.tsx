import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Tournament, Team, Player, Match, BallEvent, Innings, Ball, BatsmanStats, BowlerStats } from '../types';
import db, { AppData } from '../services/db';

interface AppContextType {
  loginId: string | null;
  isLoading: boolean;
  login: (id: string) => void;
  logout: () => void;
  createAndLogin: () => Promise<void>;
  tournaments: Tournament[];
  teams: Team[];
  matches: Match[];
  createTournament: (tournament: Omit<Tournament, 'id' | 'teams' | 'matches' | 'createdAt'>) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  getTournament: (id: string) => Tournament | undefined;
  createTeam: (tournamentId: string, team: Omit<Team, 'id' | 'players'>) => Promise<void>;
  updateTeam: (teamId: string, teamData: Partial<Omit<Team, 'id' | 'players'>>) => Promise<void>;
  getTeam: (id: string) => Team | undefined;
  addPlayerToTeam: (teamId: string, player: Omit<Player, 'id'>) => Promise<void>;
  // FIX: Removed extraneous `>` at the end of the decision type definition.
  createMatch: (tournamentId: string, teamAId: string, teamBId: string, tossWinnerId: string, decision: 'bat' | 'bowl') => Promise<Match | undefined>;
  getMatch: (id: string) => Match | undefined;
  updateScore: (matchId: string, event: BallEvent) => Promise<void>;
  undoLastBall: (matchId: string) => Promise<void>;
  updateMatchPlayers: (matchId: string, players: { strikerId: string; nonStrikerId: string; bowlerId: string; }) => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  endMatch: (matchId: string) => Promise<void>;
  changeInnings: (matchId: string) => Promise<void>;
  updatePlayerStats: (matchId: string, playerId: string, playerType: 'batsman' | 'bowler', newStats: Partial<BatsmanStats | BowlerStats>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'scorebookLoginId';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loginId, setLoginId] = useState<string | null>(null);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedId) {
      setLoginId(storedId);
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (!loginId || isInitializing) {
      return;
    }
    
    // This effect handles data loading for a logged-in user on private/admin routes.
    setAppData(null); // Clear any stale data
    const unsubscribe = db.listenToAppData(loginId, (data) => {
      setAppData(data);
    });
    return () => unsubscribe();
  }, [loginId, isInitializing]);

  const login = useCallback((id: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, id);
    setLoginId(id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setLoginId(null);
    setAppData(null);
  }, []);

  const saveData = useCallback(async (newData: AppData) => {
    if (!loginId) return;
    await db.saveAppData(loginId, newData);
  }, [loginId]);

  const createAndLogin = useCallback(async () => {
    const newId = `sb_${Date.now()}`;
    const initialState: AppData = { tournaments: [], teams: [], matches: [] };
    await db.saveAppData(newId, initialState);
    login(newId);
  }, [login]);

  const createTournament = useCallback(async (tournamentData: Omit<Tournament, 'id' | 'teams' | 'matches' | 'createdAt'>) => {
    if (!appData) return;
    const newTournament: Tournament = {
      ...tournamentData,
      id: `tourn_${Date.now()}`,
      teams: [],
      matches: [],
      createdAt: Date.now(),
    };
    const newData: AppData = { ...appData, tournaments: [...appData.tournaments, newTournament] };
    await saveData(newData);
  }, [appData, saveData]);
  
  const deleteTournament = useCallback(async (tournamentId: string) => {
    if (!appData) return;
    const tournamentToDelete = appData.tournaments.find(t => t.id === tournamentId);
    if (!tournamentToDelete) return;

    const confirmMessage = `Are you sure you want to delete the tournament "${tournamentToDelete.name}"? This will also delete all of its associated teams and matches. This action cannot be undone.`;
    const confirmDelete = window.confirm(confirmMessage);

    if (confirmDelete) {
        const teamIdsToDelete = new Set(tournamentToDelete.teams);
        const matchIdsToDelete = new Set(tournamentToDelete.matches);

        const newAppData: AppData = {
            tournaments: appData.tournaments.filter(t => t.id !== tournamentId),
            teams: appData.teams.filter(team => !teamIdsToDelete.has(team.id)),
            matches: appData.matches.filter(match => !matchIdsToDelete.has(match.id)),
        };
        
        await saveData(newAppData);
    }
  }, [appData, saveData]);

  const getTournament = useCallback((id: string) => appData?.tournaments.find(t => t.id === id), [appData]);
  
  const createTeam = useCallback(async (tournamentId: string, teamData: Omit<Team, 'id' | 'players'>) => {
    if (!appData) return;
    const newTeam: Team = { ...teamData, id: `team_${Date.now()}`, players: [] };
    const newAppData = structuredClone(appData);
    newAppData.teams.push(newTeam);
    const tournament = newAppData.tournaments.find((t: Tournament) => t.id === tournamentId);
    if (tournament) {
      tournament.teams.push(newTeam.id);
    }
    await saveData(newAppData);
  }, [appData, saveData]);
  
  const updateTeam = useCallback(async (teamId: string, teamData: Partial<Omit<Team, 'id' | 'players'>>) => {
    if (!appData) return;
    const newAppData = structuredClone(appData);
    const teamIndex = newAppData.teams.findIndex((t: Team) => t.id === teamId);
    if (teamIndex !== -1) {
        newAppData.teams[teamIndex] = { ...newAppData.teams[teamIndex], ...teamData };
        await saveData(newAppData);
    }
  }, [appData, saveData]);

  const getTeam = useCallback((id: string) => appData?.teams.find(t => t.id === id), [appData]);

  const addPlayerToTeam = useCallback(async (teamId: string, playerData: Omit<Player, 'id'>) => {
    if(!appData) return;
    const newPlayer: Player = { ...playerData, id: `player_${Date.now()}` };
    const newAppData = structuredClone(appData);
    const team = newAppData.teams.find((t: Team) => t.id === teamId);
    if(team) {
      team.players.push(newPlayer);
    }
    await saveData(newAppData);
  }, [appData, saveData]);

  // FIX: Removed extraneous `>` at the end of the decision type definition.
  const createMatch = useCallback(async (tournamentId: string, teamAId: string, teamBId: string, tossWinnerId: string, decision: 'bat' | 'bowl') => {
    if (!appData) return undefined;
    
    const battingTeamId = (tossWinnerId === teamAId && decision === 'bat') || (tossWinnerId === teamBId && decision === 'bowl') ? teamAId : teamBId;
    const bowlingTeamId = battingTeamId === teamAId ? teamBId : teamAId;
    
    const newMatch: Match = {
      id: `match_${Date.now()}`, tournamentId, teamAId, teamBId, status: 'upcoming', tossWinnerId, decision,
      currentInnings: 1, innings1: { battingTeamId, bowlingTeamId, score: 0, wickets: 0, overs: 0, balls: 0, timeline: [], batsmanStats: {}, bowlerStats: {} },
      strikerId: '', nonStrikerId: '', bowlerId: '', currentOver: [],
    };

    const newAppData = structuredClone(appData);
    newAppData.matches.push(newMatch);
    const tournament = newAppData.tournaments.find((t: Tournament) => t.id === tournamentId);
    if (tournament) {
        tournament.matches.push(newMatch.id);
    }
    await saveData(newAppData);
    return newMatch;
  }, [appData, saveData]);

  const getMatch = useCallback((id: string) => appData?.matches.find(m => m.id === id), [appData]);

  const modifyMatch = useCallback(async (matchId: string, modification: (match: Match) => Match) => {
    if (!appData) return;
    const newAppData = structuredClone(appData);
    const matchIndex = newAppData.matches.findIndex((m: Match) => m.id === matchId);
    if (matchIndex !== -1) {
      newAppData.matches[matchIndex] = modification(newAppData.matches[matchIndex]);
      await saveData(newAppData);
    }
  }, [appData, saveData]);
  
  const updatePlayerStats = useCallback(async (matchId: string, playerId: string, playerType: 'batsman' | 'bowler', newStats: Partial<BatsmanStats | BowlerStats>) => {
      await modifyMatch(matchId, (match) => {
        const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
        if (!innings) return match;

        if (playerType === 'batsman') {
          if (!innings.batsmanStats) innings.batsmanStats = {};
          if (!innings.batsmanStats[playerId]) innings.batsmanStats[playerId] = { runs: 0, balls: 0 };
          
          const stats: Partial<BatsmanStats> = {};
          if (newStats.runs !== undefined) stats.runs = Number(newStats.runs);
          if (newStats.balls !== undefined) stats.balls = Number(newStats.balls);

          innings.batsmanStats[playerId] = { ...innings.batsmanStats[playerId], ...stats };
        } else if (playerType === 'bowler') {
          if (!innings.bowlerStats) innings.bowlerStats = {};
          if (!innings.bowlerStats[playerId]) innings.bowlerStats[playerId] = { overs: 0, balls: 0, runs: 0, wickets: 0 };
          
          const stats: Partial<BowlerStats> = {};
          if ('overs' in newStats && newStats.overs !== undefined) stats.overs = Number(newStats.overs);
          if ('balls' in newStats && newStats.balls !== undefined) stats.balls = Number(newStats.balls);
          if ('runs' in newStats && newStats.runs !== undefined) stats.runs = Number(newStats.runs);
          if ('wickets' in newStats && newStats.wickets !== undefined) stats.wickets = Number(newStats.wickets);

          innings.bowlerStats[playerId] = { ...innings.bowlerStats[playerId], ...stats };
        }

        return match;
      });
    }, [modifyMatch]);

  const startMatch = useCallback(async (matchId: string) => {
    await modifyMatch(matchId, (match) => ({ ...match, status: 'live' }));
  }, [modifyMatch]);

  const endMatch = useCallback(async (matchId: string) => {
     await modifyMatch(matchId, (match) => ({ ...match, status: 'finished' }));
  }, [modifyMatch]);
  
  const changeInnings = useCallback(async (matchId: string) => {
    await modifyMatch(matchId, (match) => {
      if (match.status !== 'live' || match.currentInnings !== 1) return match;

      match.currentInnings = 2;
      match.innings2 = {
        battingTeamId: match.innings1.bowlingTeamId,
        bowlingTeamId: match.innings1.battingTeamId,
        score: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        timeline: [],
        batsmanStats: {},
        bowlerStats: {},
        target: match.innings1.score + 1,
      };
      match.strikerId = '';
      match.nonStrikerId = '';
      match.bowlerId = '';
      match.currentOver = [];

      return match;
    });
  }, [modifyMatch]);

  const updateMatchPlayers = useCallback(async (matchId: string, players: { strikerId: string; nonStrikerId: string; bowlerId: string; }) => {
    await modifyMatch(matchId, (match) => ({ ...match, ...players }));
  }, [modifyMatch]);
  
  const updateScore = useCallback(async (matchId: string, event: BallEvent) => {
    if (!appData) return;
    
    const tournamentFinder = (match: Match) => appData.tournaments.find(t => t.id === match.tournamentId);

    await modifyMatch(matchId, (match) => {
        if (match.status !== 'live') return match;

        const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
        if (!innings) return match;

        const tournament = tournamentFinder(match);
        const maxOvers = tournament?.format === 'T10' ? 10 : tournament?.format === 'T20' ? 20 : 50;
        
        let runs = 0, isWicket = false, isExtra = false, isLegalBall = true;

        switch(event) {
            case '0': case '1': case '2': case '3': case '4': case '5': case '6': runs = parseInt(event); break;
            case 'W': isWicket = true; break;
            case 'WD': runs = 1; isExtra = true; isLegalBall = false; break;
            case 'NB': runs = 1; isExtra = true; isLegalBall = false; break;
            case 'LB': runs = 1; isExtra = true; break;
        }

        innings.score += runs;
        if (isLegalBall) innings.balls++;
        if(isWicket) innings.wickets++;

        // Update batsman stats
        const strikerId = match.strikerId;
        if (strikerId) {
            if (!innings.batsmanStats) innings.batsmanStats = {};
            if (!innings.batsmanStats[strikerId]) {
                innings.batsmanStats[strikerId] = { runs: 0, balls: 0 };
            }
            const batsmanRuns = ['0', '1', '2', '3', '4', '5', '6'].includes(event) ? parseInt(event) : 0;
            innings.batsmanStats[strikerId].runs += batsmanRuns;

            if (isLegalBall) {
                innings.batsmanStats[strikerId].balls++;
            }
        }
        
        // Update bowler stats
        const bowlerId = match.bowlerId;
        if (bowlerId) {
            if (!innings.bowlerStats) innings.bowlerStats = {};
            if (!innings.bowlerStats[bowlerId]) {
                innings.bowlerStats[bowlerId] = { overs: 0, balls: 0, runs: 0, wickets: 0 };
            }
            const bowlerStats = innings.bowlerStats[bowlerId];
            if (event !== 'LB') { // Leg-byes don't count against the bowler
                bowlerStats.runs += runs;
            }
            if (isWicket) bowlerStats.wickets++;
            if (isLegalBall) {
                bowlerStats.balls++;
                if (bowlerStats.balls === 6) {
                    bowlerStats.overs++;
                    bowlerStats.balls = 0;
                }
            }
        }

        const newBall: Ball = {
            ballNumber: innings.balls, overNumber: innings.overs, event, runs, isWicket, isExtra,
            batsmanId: match.strikerId, bowlerId: match.bowlerId
        };
        innings.timeline.push(newBall);

        if (isLegalBall) {
            match.currentOver.push(newBall);
        }
        
        if ([1, 3, 5].includes(runs) && isLegalBall) {
            [match.strikerId, match.nonStrikerId] = [match.nonStrikerId, match.strikerId];
        }

        if (innings.balls === 6) {
            innings.overs++;
            innings.balls = 0;
            match.currentOver = []; // Clear for the new over
            [match.strikerId, match.nonStrikerId] = [match.nonStrikerId, match.strikerId];
        }
        
        if(innings.wickets === 10 || innings.overs === maxOvers) {
            if (match.currentInnings === 1) {
                match.currentInnings = 2;
                match.innings2 = {
                    battingTeamId: match.innings1.bowlingTeamId, bowlingTeamId: match.innings1.battingTeamId,
                    score: 0, wickets: 0, overs: 0, balls: 0, timeline: [], batsmanStats: {}, bowlerStats: {}, target: innings.score + 1
                };
                match.strikerId = ''; match.nonStrikerId = ''; match.bowlerId = '';
                match.currentOver = [];
            } else {
                match.status = 'finished';
            }
        }
        
        if (match.innings2?.target && match.innings2.score >= match.innings2.target) {
            match.status = 'finished';
        }

        return match;
    });

  }, [appData, modifyMatch]);

  const undoLastBall = useCallback(async (matchId: string) => {
    await modifyMatch(matchId, (match) => {
      const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
      if (!innings || innings.timeline.length === 0) return match;

      const lastBall = innings.timeline.pop();
      if (!lastBall) return match;
      
      innings.score -= lastBall.runs;
      if(lastBall.isWicket) innings.wickets--;
      
      // Revert batsman stats
      const batsmanId = lastBall.batsmanId;
      if (batsmanId && innings.batsmanStats && innings.batsmanStats[batsmanId]) {
          const batsmanRuns = ['0', '1', '2', '3', '4', '5', '6'].includes(lastBall.event) ? parseInt(lastBall.event) : 0;
          innings.batsmanStats[batsmanId].runs -= batsmanRuns;

          if (!['WD', 'NB'].includes(lastBall.event)) { // Was a legal ball
               innings.batsmanStats[batsmanId].balls--;
          }
      }

      // Revert bowler stats
      const bowlerId = lastBall.bowlerId;
      if (bowlerId && innings.bowlerStats && innings.bowlerStats[bowlerId]) {
        const bowlerStats = innings.bowlerStats[bowlerId];
        if (lastBall.event !== 'LB') {
          bowlerStats.runs -= lastBall.runs;
        }
        if (lastBall.isWicket) {
          bowlerStats.wickets--;
        }
        if (!['WD', 'NB'].includes(lastBall.event)) { // Was a legal ball
          if (bowlerStats.balls === 0) {
            bowlerStats.overs--;
            bowlerStats.balls = 5;
          } else {
            bowlerStats.balls--;
          }
        }
      }

      const wasLegalBall = !['WD', 'NB'].includes(lastBall.event);
      if (wasLegalBall) {
        // Correctly handle decrementing across over boundaries.
        innings.balls--;
        if (innings.balls < 0) {
          innings.overs--;
          innings.balls = 5; // A full over has 6 balls, indexed 0-5.
        }
      }

      // Rebuild currentOver from the timeline to ensure it's always consistent.
      // If we are at the end of an over (e.g., overs: 2, balls: 0), we want to display
      // the over that was just completed (over index 1).
      const overNumberToDisplay = innings.balls === 0 ? innings.overs - 1 : innings.overs;

      if (overNumberToDisplay >= 0) {
        match.currentOver = innings.timeline.filter(ball => {
            const isLegal = !['WD', 'NB'].includes(ball.event);
            return ball.overNumber === overNumberToDisplay && isLegal;
        });
      } else {
        match.currentOver = [];
      }
      
      match.strikerId = lastBall.batsmanId;
      // Note: Reverting non-striker is complex, so we'll leave it as is for simplicity.
      // Usually, the scorer would just correct players if needed.
      return match;
    });
  }, [modifyMatch]);

  const isLoading = isInitializing || (!!loginId && appData === null);
  const tournaments = appData?.tournaments ?? [];
  const teams = appData?.teams ?? [];
  const matches = appData?.matches ?? [];
  const value = { loginId, isLoading, login, logout, createAndLogin, tournaments, teams, matches, createTournament, deleteTournament, getTournament, createTeam, updateTeam, getTeam, addPlayerToTeam, createMatch, getMatch, updateScore, undoLastBall, updateMatchPlayers, startMatch, endMatch, changeInnings, updatePlayerStats };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
