import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import db, { AppData } from '../services/db';
import { Match, Team, Innings, Player, Ball } from '../types';
import ScoreboardDisplay from '../components/ScoreboardDisplay';

// Helper hook to parse URL query parameters
function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

// Helper to find entities from data
const useAppData = (initialData: AppData | null) => {
    return useMemo(() => {
        const getTeam = (id: string): Team | undefined => initialData?.teams.find(t => t.id === id);
        const getPlayer = (teamId: string, playerId: string): Player | undefined => getTeam(teamId)?.players.find(p => p.id === playerId);
        return { data: initialData, getTeam, getPlayer };
    }, [initialData]);
};


const ScoreboardOverlay: React.FC = () => {
    const { scorebookId, matchId } = useParams<{ scorebookId: string; matchId: string }>();
    const [appData, setAppData] = useState<AppData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const query = useQuery();
    const theme = query.get('theme') || 'midnight-pro'; // Default to midnight-pro

    useEffect(() => {
        if (!scorebookId) {
            setError("Scorebook ID is missing.");
            return;
        }
        if (!matchId) {
            setError("Match ID is missing.");
            return;
        }

        const unsubscribe = db.listenToAppData(scorebookId, (data) => {
            setAppData(data);
            setError(null);
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, [scorebookId, matchId]);

    const { getTeam, getPlayer } = useAppData(appData);

    const match = useMemo<Match | undefined>(() => {
        return appData?.matches.find(m => m.id === matchId);
    }, [appData, matchId]);

    if (error) {
        return <div className="text-red-500 font-bold p-4 bg-black/50">{error}</div>;
    }
    
    if (!appData || !match) {
        // Transparent loading/waiting state
        return <div />;
    }

    const teamA = getTeam(match.teamAId);
    const teamB = getTeam(match.teamBId);
    const currentInnings: Innings | undefined = match.currentInnings === 1 ? match.innings1 : match.innings2;
    const battingTeam = getTeam(currentInnings?.battingTeamId || '');
    const bowlingTeam = getTeam(currentInnings?.bowlingTeamId || '');
    
    if (!currentInnings || !battingTeam || !bowlingTeam || !teamA || !teamB) {
        // Transparent loading state for teams
        return <div />;
    }

    const { score, wickets, overs, balls } = currentInnings;
    const crr = overs + balls / 6 > 0 ? (score / (overs + balls / 6)).toFixed(2) : '0.00';
    
    const striker = getPlayer(battingTeam.id, match.strikerId);
    const nonStriker = getPlayer(battingTeam.id, match.nonStrikerId);
    const bowler = bowlingTeam?.players.find(p => p.id === match.bowlerId);
    const bowlerStats = currentInnings.bowlerStats?.[match.bowlerId];

    const strikerStats = currentInnings.batsmanStats?.[match.strikerId] || { runs: 0, balls: 0 };
    const nonStrikerStats = currentInnings.batsmanStats?.[match.nonStrikerId] || { runs: 0, balls: 0 };
    const currentOver = match.currentOver || [];

    return (
        <ScoreboardDisplay 
            theme={theme}
            battingTeam={battingTeam}
            bowlingTeam={bowlingTeam}
            teamA={teamA}
            teamB={teamB}
            match={match}
            bowler={bowler}
            striker={striker}
            nonStriker={nonStriker}
            currentInnings={currentInnings}
            strikerStats={strikerStats}
            nonStrikerStats={nonStrikerStats}
            bowlerStats={bowlerStats}
            crr={crr}
            currentOver={currentOver}
        />
    );
};

export default ScoreboardOverlay;
