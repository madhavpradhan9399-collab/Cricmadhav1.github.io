import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Layout from '../components/Layout';
import ScoringControls from '../components/ScoringControls';
import { Innings, Team } from '../types';
import ScoreboardDisplay from '../components/ScoreboardDisplay'; // Import the new component

const OverlayControlPanel: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const { getMatch, getTeam, getTournament, loginId } = useAppContext();
    const [selectedTheme, setSelectedTheme] = useState('elite-crystal');

    const match = useMemo(() => matchId ? getMatch(matchId) : undefined, [getMatch, matchId]);
    const teamA = useMemo(() => getTeam(match?.teamAId || ''), [getTeam, match]);
    const teamB = useMemo(() => getTeam(match?.teamBId || ''), [getTeam, match]);
    const tournament = useMemo(() => getTournament(match?.tournamentId || ''), [getTournament, match]);
    
    const currentInnings = useMemo<Innings | undefined>(() => {
        if (!match) return undefined;
        return match.currentInnings === 1 ? match.innings1 : match.innings2;
    }, [match]);

    const battingTeam = useMemo<Team | undefined>(() => getTeam(currentInnings?.battingTeamId || ''), [getTeam, currentInnings]);
    const bowlingTeam = useMemo<Team | undefined>(() => getTeam(currentInnings?.bowlingTeamId || ''), [getTeam, currentInnings]);

    if (!matchId) {
        return <Layout title="Error"><p>Match ID not found.</p></Layout>;
    }
    
    const overlayUrl = `${window.location.origin}${window.location.pathname}#/public/${loginId}/match/${matchId}/overlay?theme=${selectedTheme}`;
    const shortUrl = `#/public/.../overlay?theme=${selectedTheme}`;

    if (!match || !teamA || !teamB || !currentInnings || !battingTeam || !bowlingTeam || !tournament) {
        return <Layout title="Loading..."><p>Loading match data...</p></Layout>;
    }
    
    const { score, wickets, overs, balls } = currentInnings;
    const crr = overs + balls / 6 > 0 ? (score / (overs + balls / 6)).toFixed(2) : '0.00';
    const matchTitle = `${teamA.name} vs ${teamB.name}`;

    // Get player data for the live preview
    const striker = battingTeam.players.find(p => p.id === match.strikerId);
    const nonStriker = battingTeam.players.find(p => p.id === match.nonStrikerId);
    const bowler = bowlingTeam.players.find(p => p.id === match.bowlerId);
    const bowlerStats = currentInnings.bowlerStats?.[match.bowlerId];
    const strikerStats = currentInnings.batsmanStats?.[match.strikerId] || { runs: 0, balls: 0 };
    const nonStrikerStats = currentInnings.batsmanStats?.[match.nonStrikerId] || { runs: 0, balls: 0 };
    const currentOver = match.currentOver || [];

    return (
        <Layout title="Scoring Control Panel" backLink={{ to: `/tournament/${match.tournamentId}/fixtures`, text: 'Back to Fixtures' }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left side with Preview and Score Summary */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Live Preview Section */}
                     <div className="bg-secondary p-6 rounded-lg shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Live Preview</h3>
                            <div className="flex items-center gap-2">
                                <label htmlFor="theme-select" className="text-sm font-medium text-text-secondary">Theme:</label>
                                <select 
                                    id="theme-select"
                                    value={selectedTheme}
                                    onChange={(e) => setSelectedTheme(e.target.value)}
                                    className="bg-accent p-2 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-highlight"
                                >
                                    <optgroup label="Elite Series">
                                        <option value="elite-crystal">Crystal</option>
                                        <option value="elite-apex">Apex</option>
                                        <option value="elite-vanguard">Vanguard</option>
                                        <option value="elite-heritage">Heritage</option>
                                        <option value="elite-blaze">Blaze</option>
                                    </optgroup>
                                    <optgroup label="Standard">
                                        <option value="midnight-pro">Midnight Pro</option>
                                        <option value="classic-blue">Classic Blue</option>
                                        <option value="clean-light">Clean Light</option>
                                        <option value="aliens-vs-mstars">Aliens vs M'Stars</option>
                                        <option value="mavericks-vs-raptors">Mavericks vs Raptors</option>
                                        <option value="sharks-vs-crocs">Sharks vs Crocs</option>
                                        <option value="gold-vs-black">Gold vs Black</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden ring-1 ring-accent flex items-center justify-center">
                           <ScoreboardDisplay
                                theme={selectedTheme}
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Overlay URL Section */}
                        <div className="bg-secondary p-6 rounded-lg shadow-xl">
                            <h3 className="text-xl font-bold mb-4 text-white">Overlay URL</h3>
                            <div className="bg-primary p-4 rounded-lg">
                                <label className="text-sm text-text-secondary block mb-1">Copy this URL for OBS, Prism, etc.</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={shortUrl}
                                        className="w-full bg-accent p-2 rounded-lg text-white placeholder-text-secondary font-mono text-sm"
                                    />
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(overlayUrl)}
                                        className="bg-highlight text-primary font-bold py-2 px-4 rounded-lg hover:bg-teal-300 transition-colors text-sm shrink-0"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Score Summary Section */}
                        <div className="bg-secondary p-6 rounded-lg shadow-xl">
                             <div className="flex justify-between items-start mb-4 h-full flex-col">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{matchTitle}</h2>
                                    <p className="text-text-secondary text-sm">{`Status: ${match.status.toUpperCase()}`}</p>
                                </div>
                                <div className="bg-primary p-4 rounded-lg text-center w-full mt-4">
                                    <p className="text-md text-text-secondary">{battingTeam.name} Batting</p>
                                    <p className="text-4xl font-black text-white tracking-tighter">{score}-{wickets}
                                        <span className="text-2xl font-bold text-text-secondary ml-2">({overs}.{balls})</span>
                                    </p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right side with Controls */}
                <div className="lg:col-span-1 space-y-8">
                    <ScoringControls matchId={matchId} />
                </div>
            </div>
        </Layout>
    );
};

export default OverlayControlPanel;
