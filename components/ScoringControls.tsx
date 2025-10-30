import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { BallEvent, Team, Player, BatsmanStats, BowlerStats } from '../types';
import Modal from './Modal';

interface ScoringControlsProps {
  matchId: string;
}

const ScoringControls: React.FC<ScoringControlsProps> = ({ matchId }) => {
    const { getMatch, getTeam, updateScore, undoLastBall, startMatch, endMatch, updateMatchPlayers, changeInnings, updatePlayerStats } = useAppContext();
    
    const match = useMemo(() => getMatch(matchId), [getMatch, matchId]);
    
    const [isPlayerSelectModalOpen, setIsPlayerSelectModalOpen] = useState(false);
    const [isEditStatsModalOpen, setIsEditStatsModalOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<{ id: string; name: string; type: 'batsman' | 'bowler' } | null>(null);
    const [editedStats, setEditedStats] = useState<Partial<BatsmanStats & BowlerStats>>({});

    const [selectedStriker, setSelectedStriker] = useState('');
    const [selectedNonStriker, setSelectedNonStriker] = useState('');
    const [selectedBowler, setSelectedBowler] = useState('');

    const currentInnings = useMemo(() => {
        if (!match) return undefined;
        return match.currentInnings === 1 ? match.innings1 : match.innings2;
    }, [match]);

    const battingTeam = useMemo<Team | undefined>(() => getTeam(currentInnings?.battingTeamId || ''), [getTeam, currentInnings]);
    const bowlingTeam = useMemo<Team | undefined>(() => getTeam(currentInnings?.bowlingTeamId || ''), [getTeam, currentInnings]);

    const striker = useMemo<Player | undefined>(() => battingTeam?.players.find(p => p.id === match?.strikerId), [battingTeam, match]);
    const nonStriker = useMemo<Player | undefined>(() => battingTeam?.players.find(p => p.id === match?.nonStrikerId), [battingTeam, match]);
    const bowler = useMemo<Player | undefined>(() => bowlingTeam?.players.find(p => p.id === match?.bowlerId), [bowlingTeam, match]);
    const bowlerStats = useMemo(() => currentInnings?.bowlerStats?.[match?.bowlerId] || { overs: 0, balls: 0, runs: 0, wickets: 0 }, [currentInnings, match]);

    const handlePlayerSelectSave = useCallback(async () => {
        if(matchId && selectedStriker && selectedNonStriker && selectedBowler) {
            await updateMatchPlayers(matchId, {
                strikerId: selectedStriker,
                nonStrikerId: selectedNonStriker,
                bowlerId: selectedBowler,
            });
            setIsPlayerSelectModalOpen(false);
            if (match?.status === 'upcoming') {
                await startMatch(matchId);
            }
        }
    }, [matchId, selectedStriker, selectedNonStriker, selectedBowler, updateMatchPlayers, startMatch, match]);

    const handleChangeInnings = () => {
        const confirm = window.confirm("Are you sure you want to end the current innings and start the next one? This action cannot be undone.");
        if (confirm) {
            changeInnings(matchId);
        }
    };

    const handleOpenEditModal = (type: 'batsman' | 'bowler', player: Player) => {
        setEditingPlayer({ id: player.id, name: player.name, type });
        if (type === 'batsman') {
            const stats = currentInnings?.batsmanStats?.[player.id] || { runs: 0, balls: 0 };
            setEditedStats(stats);
        } else {
            const stats = currentInnings?.bowlerStats?.[player.id] || { overs: 0, balls: 0, runs: 0, wickets: 0 };
            setEditedStats(stats);
        }
        setIsEditStatsModalOpen(true);
    };

    const handleStatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedStats(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveStats = async () => {
        if (editingPlayer) {
            const numericStats = Object.entries(editedStats).reduce((acc, [key, value]) => {
                acc[key] = Number(value) || 0;
                return acc;
            }, {} as any);

            await updatePlayerStats(matchId, editingPlayer.id, editingPlayer.type, numericStats);
            setIsEditStatsModalOpen(false);
            setEditingPlayer(null);
            setEditedStats({});
        }
    };


    useEffect(() => {
        if (match && (match.status === 'upcoming' || !match.strikerId || !match.bowlerId)) {
            setIsPlayerSelectModalOpen(true);
        }
         if(match){
            setSelectedStriker(match.strikerId);
            setSelectedNonStriker(match.nonStrikerId);
            setSelectedBowler(match.bowlerId);
        }
    }, [match]);

    if (!match || !currentInnings || !battingTeam || !bowlingTeam) {
        return <div className="bg-secondary p-6 rounded-lg shadow-xl"><p>Loading controls...</p></div>;
    }

    const scoreButtons: BallEvent[] = ['0', '1', '2', '3', '4', '6'];
    const extraButtons: BallEvent[] = ['W', 'WD', 'NB', 'LB'];
    const canScore = match.status === 'live' && striker && nonStriker && bowler;

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold mb-4">Scoring Controls</h3>
            
            <div className="flex flex-wrap gap-4 text-white mb-4">
                <div className="bg-accent p-3 rounded-lg flex-1 min-w-[200px]">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-text-secondary">Striker</p>
                        {striker && <button onClick={() => handleOpenEditModal('batsman', striker)} className="text-highlight hover:text-teal-300 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>}
                    </div>
                    <p className="font-semibold truncate">{striker?.name || 'N/A'}</p>
                </div>
                <div className="bg-accent p-3 rounded-lg flex-1 min-w-[200px]">
                     <div className="flex justify-between items-center">
                        <p className="text-sm text-text-secondary">Non-Striker</p>
                        {nonStriker && <button onClick={() => handleOpenEditModal('batsman', nonStriker)} className="text-highlight hover:text-teal-300 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>}
                    </div>
                    <p className="font-semibold truncate">{nonStriker?.name || 'N/A'}</p>
                </div>
                <div className="bg-accent p-3 rounded-lg flex-1 min-w-[200px]">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-text-secondary">Bowler</p>
                        {bowler && <button onClick={() => handleOpenEditModal('bowler', bowler)} className="text-highlight hover:text-teal-300 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>}
                    </div>
                    <p className="font-semibold truncate">{bowler?.name || 'N/A'}</p>
                     {bowler && <p className="text-xs text-text-secondary">{bowlerStats.wickets}-{bowlerStats.runs} ({bowlerStats.overs}.{bowlerStats.balls})</p>}
                </div>
                <button onClick={() => setIsPlayerSelectModalOpen(true)} className="self-center text-center bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    Change Players
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                {scoreButtons.map(evt => (
                    <button key={evt} disabled={!canScore} onClick={() => updateScore(matchId, evt)} className="bg-blue-600 disabled:bg-gray-600 text-white text-2xl font-bold h-16 rounded-lg hover:bg-blue-500 transition-colors">{evt}</button>
                ))}
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
                {extraButtons.map(evt => (
                    <button key={evt} disabled={!canScore} onClick={() => updateScore(matchId, evt)} className="bg-red-600 disabled:bg-gray-600 text-white text-lg font-bold h-16 rounded-lg hover:bg-red-500 transition-colors">{evt}</button>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
                <button 
                    onClick={() => undoLastBall(matchId)} 
                    className="bg-yellow-500 text-primary font-bold py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm"
                >
                    UNDO
                </button>
                <button
                    onClick={handleChangeInnings}
                    disabled={match.currentInnings === 2 || match.status === 'finished'}
                    className="bg-orange-500 text-primary font-bold py-2 rounded-lg hover:bg-orange-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                >
                    CHG INNINGS
                </button>
                <button 
                    onClick={() => endMatch(matchId)} 
                    className="bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-500 transition-colors text-sm"
                >
                    END MATCH
                </button>
            </div>
        
            <Modal isOpen={isPlayerSelectModalOpen} onClose={() => setIsPlayerSelectModalOpen(false)} title="Select Players">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Striker</label>
                        <select value={selectedStriker} onChange={e => setSelectedStriker(e.target.value)} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight">
                            <option value="">Select Striker</option>
                            {battingTeam.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary">Non-Striker</label>
                        <select value={selectedNonStriker} onChange={e => setSelectedNonStriker(e.target.value)} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight">
                            <option value="">Select Non-Striker</option>
                            {battingTeam.players.filter(p => p.id !== selectedStriker).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary">Bowler</label>
                        <select value={selectedBowler} onChange={e => setSelectedBowler(e.target.value)} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight">
                             <option value="">Select Bowler</option>
                            {bowlingTeam.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handlePlayerSelectSave} className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-colors">Save & Start</button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isEditStatsModalOpen} onClose={() => setIsEditStatsModalOpen(false)} title={`Edit Stats: ${editingPlayer?.name}`}>
                {editingPlayer && (
                    <div className="space-y-4">
                        {editingPlayer.type === 'batsman' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Runs</label>
                                    <input type="number" name="runs" value={editedStats.runs ?? ''} onChange={handleStatInputChange} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Balls</label>
                                    <input type="number" name="balls" value={editedStats.balls ?? ''} onChange={handleStatInputChange} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Overs</label>
                                        <input type="number" name="overs" value={editedStats.overs ?? ''} onChange={handleStatInputChange} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Balls</label>
                                        <input type="number" name="balls" value={editedStats.balls ?? ''} onChange={handleStatInputChange} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Runs Conceded</label>
                                        <input type="number" name="runs" value={editedStats.runs ?? ''} onChange={handleStatInputChange} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Wickets</label>
                                        <input type="number" name="wickets" value={editedStats.wickets ?? ''} onChange={handleStatInputChange} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight" />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="flex justify-end pt-4">
                            <button onClick={handleSaveStats} className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-colors">Save Changes</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ScoringControls;
