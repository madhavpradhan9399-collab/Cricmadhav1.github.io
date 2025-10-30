

import React, { useState, useEffect } from 'react';
import { Team, Player, Innings, BatsmanStats, Ball, BallEvent, BowlerStats, Match } from '../types';

// --- ELITE SERIES BROADCAST THEME LAYOUT ---

const EliteBroadcastLayout: React.FC<ScoreboardDisplayProps & { sticker: BallEvent | null }> = (props) => {
    const { 
        theme, battingTeam, bowlingTeam, bowler, striker, nonStriker, currentInnings, 
        strikerStats, nonStrikerStats, bowlerStats, crr, sticker, teamA, teamB, match
    } = props;
    
    if (!battingTeam || !bowlingTeam || !currentInnings || !match || !teamA || !teamB) return null;

    const { score, wickets, overs, balls, target } = currentInnings;
    
    const firstInnings = match.innings1;
    const isSecondInnings = match.currentInnings === 2;
    
    function getTeamById(id: string) {
        if (teamA?.id === id) return teamA;
        if (teamB?.id === id) return teamB;
        return undefined;
    }
    const firstInningsTeam = getTeamById(match.innings1.battingTeamId);

    const themeKey = theme.replace('elite-', '');

    const themes: { [key: string]: { [key: string]: string } } = {
        crystal: {
            container: 'font-sans text-white',
            bg: 'bg-white/10 backdrop-blur-xl border border-white/20',
            teamName: 'text-white font-bold tracking-wider',
            score: 'text-white font-black',
            accent: 'text-cyan-300',
            subText: 'text-white/80',
            divider: 'bg-white/20',
        },
        apex: {
            container: 'font-sans text-white uppercase',
            bg: 'bg-gray-900/80 backdrop-blur-md border border-gray-700',
            teamName: 'text-white font-bold tracking-widest',
            score: 'text-white font-black',
            accent: 'text-yellow-400',
            subText: 'text-gray-300',
            divider: 'bg-gray-700',
            texture: "bg-[url('https://www.transparenttextures.com/patterns/brushed-metal.png')]",
        },
        vanguard: {
            container: 'font-mono text-cyan-300 uppercase',
            bg: 'bg-indigo-950/80 backdrop-blur-lg border border-cyan-500/30',
            teamName: 'text-white font-bold',
            score: 'text-white font-black',
            accent: 'text-magenta-500', // A different accent color can be cool
            subText: 'text-cyan-300/80',
            divider: 'bg-cyan-500/30',
            texture: "bg-[url('https://www.transparenttextures.com/patterns/hexabump.png')] opacity-80",
        },
        heritage: {
            container: 'font-serif text-gray-200',
            bg: 'bg-green-900/90 backdrop-blur-lg border border-yellow-400/30',
            teamName: 'text-white font-bold',
            score: 'text-white font-bold',
            accent: 'text-yellow-400',
            subText: 'text-gray-300',
            divider: 'bg-yellow-400/30',
        },
        blaze: {
            container: 'font-sans text-white italic',
            bg: 'bg-black/70 backdrop-blur-md border-t-2 border-orange-500',
            teamName: 'text-white font-black text-2xl tracking-wider',
            score: 'text-white font-black',
            accent: 'text-orange-400',
            subText: 'text-gray-200',
            divider: 'bg-orange-500/50',
            texture: "bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]",
        },
    };

    const s = themes[themeKey] || themes['crystal'];

    const PlayerStatLine: React.FC<{name?: string, runs: number, balls: number, isStriker?: boolean}> = ({name, runs, balls, isStriker}) => (
        <div className="flex justify-between items-baseline text-lg">
            <p className="truncate font-semibold">
                {name || '...'}
                {isStriker && <span className={`ml-1 ${s.accent}`}>*</span>}
            </p>
            <p className={`font-bold`}>{runs} <span className="font-normal text-sm opacity-80">({balls})</span></p>
        </div>
    );
    
    return (
        <div className={`w-full h-full p-4 flex flex-col justify-end relative ${s.container}`}>
            {sticker && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20 animate-pop-in-out">
                    <span className={`font-black text-9xl ${sticker === 'W' ? 'text-red-500' : 'text-green-400'}`} style={{ textShadow: '0 5px 20px rgba(0,0,0,0.7)' }}>
                        {sticker === 'W' ? 'OUT!' : sticker}
                    </span>
                </div>
            )}
             <div className={`relative rounded-lg shadow-2xl p-4 ${s.bg}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}>
                 {s.texture && <div className={`absolute inset-0 opacity-20 ${s.texture}`} />}
                
                <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Left Side: Players */}
                    <div className="space-y-1">
                        <PlayerStatLine name={striker?.name} runs={strikerStats.runs} balls={strikerStats.balls} isStriker />
                        <PlayerStatLine name={nonStriker?.name} runs={nonStrikerStats.runs} balls={nonStrikerStats.balls} />
                    </div>

                    {/* Center: Team Score */}
                     <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            {teamA.logoUrl && <img src={teamA.logoUrl} alt={teamA.name} className="h-8 w-8 object-contain" />}
                            <p className={`text-lg ${s.teamName}`}>{teamA.name}</p>
                            <span className={`text-sm font-bold ${s.accent}`}>VS</span>
                            <p className={`text-lg ${s.teamName}`}>{teamB.name}</p>
                            {teamB.logoUrl && <img src={teamB.logoUrl} alt={teamB.name} className="h-8 w-8 object-contain" />}
                        </div>
                        <div className="flex items-baseline justify-center gap-3 mt-1">
                            <p className={`text-5xl ${s.score}`}>{score}-{wickets}</p>
                            <p className={`text-2xl font-bold ${s.subText}`}>({overs}.{balls})</p>
                        </div>
                    </div>
                    
                    {/* Right Side: Bowler and Target */}
                    <div className="text-right space-y-1">
                         <div className="flex justify-end items-center gap-3 text-lg">
                            <div className="text-right">
                                <p className="truncate font-semibold">{bowler?.name || '...'}</p>
                                {bowlerStats && <p className={`font-bold text-sm`}>{bowlerStats.wickets}-{bowlerStats.runs}</p>}
                            </div>
                            {bowlingTeam.logoUrl && <img src={bowlingTeam.logoUrl} alt={bowlingTeam.name} className="h-10 w-10 object-contain" />}
                        </div>
                         <div className={`w-full h-px my-1 ${s.divider}`} />
                        {isSecondInnings ? (
                             <div className="text-lg">
                                <p className={`font-bold ${s.accent}`}>Target: {target}</p>
                                <p className={`${s.subText} text-sm`}>{firstInningsTeam?.name} {firstInnings.score}-{firstInnings.wickets}</p>
                             </div>
                        ) : (
                            <div className="text-lg">
                                <p className={`font-bold ${s.accent}`}>First Innings</p>
                                <p className={`${s.subText} text-sm`}>CRR: {crr}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- STANDARD THEME LAYOUT ---

interface ThemeStyles {
    container: string; header: string; scoreBg: string; scoreText: string; oversText: string;
    crrText: string; playerSectionHeaderText: string; playerNameText: string; playerStatsText: string;
    ballDefault: string; ballWicket: string; ballBoundary: string; ballExtra: string; ballUpcoming: string; targetText: string;
}

const themes: { [key: string]: ThemeStyles } = {
    'midnight-pro': {
        container: 'bg-black/80 backdrop-blur-md text-white border-white/20', header: 'border-white/20',
        scoreBg: 'bg-transparent', scoreText: 'text-white', oversText: 'text-white/80', crrText: 'text-white/70',
        playerSectionHeaderText: 'text-white/70', playerNameText: 'text-white', playerStatsText: 'text-white',
        ballDefault: 'bg-white/20', ballWicket: 'bg-red-600', ballBoundary: 'bg-green-500', ballExtra: 'bg-yellow-500 text-black',
        ballUpcoming: 'border-dashed border-white/20', targetText: 'text-yellow-400',
    },
    'classic-blue': {
        container: 'bg-gradient-to-b from-blue-800 to-blue-900 backdrop-blur-md text-white border-blue-500', header: 'border-blue-400',
        scoreBg: 'bg-black/20', scoreText: 'text-white', oversText: 'text-blue-200', crrText: 'text-blue-200',
        playerSectionHeaderText: 'text-blue-200', playerNameText: 'text-white', playerStatsText: 'text-yellow-300',
        ballDefault: 'bg-blue-600', ballWicket: 'bg-red-600', ballBoundary: 'bg-yellow-400 text-black', ballExtra: 'bg-pink-500 text-white',
        ballUpcoming: 'border-solid border-blue-400', targetText: 'text-yellow-300',
    },
    'clean-light': {
        container: 'bg-white/90 backdrop-blur-md text-gray-800 border-gray-300', header: 'border-gray-200',
        scoreBg: 'bg-transparent', scoreText: 'text-black', oversText: 'text-gray-600', crrText: 'text-gray-500',
        playerSectionHeaderText: 'text-gray-500', playerNameText: 'text-gray-800', playerStatsText: 'text-black',
        ballDefault: 'bg-gray-300', ballWicket: 'bg-red-500 text-white', ballBoundary: 'bg-green-500 text-white', ballExtra: 'bg-blue-500 text-white',
        ballUpcoming: 'border-dashed border-gray-400', targetText: 'text-blue-600',
    },
    'aliens-vs-mstars': {
        container: 'bg-gradient-to-br from-gray-900 via-purple-900 to-green-900 backdrop-blur-md text-white border-purple-500/50', header: 'border-purple-400/50',
        scoreBg: 'bg-transparent', scoreText: 'text-lime-300', oversText: 'text-white/80', crrText: 'text-white/70',
        playerSectionHeaderText: 'text-purple-300/80', playerNameText: 'text-white', playerStatsText: 'text-lime-300',
        ballDefault: 'bg-purple-500/50', ballWicket: 'bg-red-600', ballBoundary: 'bg-lime-400 text-black', ballExtra: 'bg-fuchsia-500 text-white',
        ballUpcoming: 'border-dashed border-purple-400/50', targetText: 'text-lime-300',
    },
    'mavericks-vs-raptors': {
        container: 'bg-gradient-to-b from-slate-800 to-slate-900 backdrop-blur-md text-white border-red-500/50', header: 'border-red-400/50',
        scoreBg: 'bg-transparent', scoreText: 'text-white', oversText: 'text-blue-200', crrText: 'text-blue-200/80',
        playerSectionHeaderText: 'text-blue-200/80', playerNameText: 'text-white', playerStatsText: 'text-white',
        ballDefault: 'bg-blue-600/70', ballWicket: 'bg-red-600', ballBoundary: 'bg-green-500', ballExtra: 'bg-yellow-500 text-black',
        ballUpcoming: 'border-dashed border-blue-400/50', targetText: 'text-yellow-400',
    },
    'sharks-vs-crocs': {
        container: 'bg-gradient-to-b from-teal-900 to-gray-900 backdrop-blur-md text-white border-green-500/50', header: 'border-green-400/50',
        scoreBg: 'bg-transparent', scoreText: 'text-white', oversText: 'text-green-200', crrText: 'text-green-200/80',
        playerSectionHeaderText: 'text-blue-200/80', playerNameText: 'text-white', playerStatsText: 'text-white',
        ballDefault: 'bg-blue-900/80', ballWicket: 'bg-red-600', ballBoundary: 'bg-green-500', ballExtra: 'bg-yellow-500 text-black',
        ballUpcoming: 'border-dashed border-blue-400/50', targetText: 'text-yellow-400',
    },
    'gold-vs-black': {
        container: 'bg-black/80 backdrop-blur-md text-white border-yellow-500/40', header: 'border-yellow-500/40',
        scoreBg: 'bg-transparent', scoreText: 'text-white', oversText: 'text-gray-300', crrText: 'text-gray-400',
        playerSectionHeaderText: 'text-gray-400', playerNameText: 'text-white', playerStatsText: 'text-yellow-400',
        ballDefault: 'bg-gray-700', ballWicket: 'bg-red-600', ballBoundary: 'bg-orange-500', ballExtra: 'bg-white text-black',
        ballUpcoming: 'border-dashed border-gray-600', targetText: 'text-yellow-400',
    },
};

interface ScoreboardDisplayProps {
  theme: string;
  battingTeam?: Team; bowlingTeam?: Team; teamA?: Team; teamB?: Team; match?: Match;
  bowler?: Player; striker?: Player; nonStriker?: Player; currentInnings?: Innings;
  strikerStats: BatsmanStats; nonStrikerStats: BatsmanStats; bowlerStats?: BowlerStats;
  crr: string; currentOver: Ball[];
}

const BallDisplay: React.FC<{ event: BallEvent, styles: ThemeStyles }> = ({ event, styles }) => {
    let style = styles.ballDefault; let content: string | number = event;
    switch(event) {
        case 'W': style = styles.ballWicket; break;
        case '4': case '6': style = styles.ballBoundary; break;
        case 'WD': case 'NB': case 'LB': style = styles.ballExtra; break;
        default: content = parseInt(event);
    }
    if (['WD', 'NB', 'LB'].includes(event)) { content = event.slice(0, 2); }
    return <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${style}`}>{content}</div>;
}

const ScoreboardDisplay: React.FC<ScoreboardDisplayProps> = (props) => {
    const { theme, battingTeam, bowlingTeam, bowler, striker, nonStriker, currentInnings, strikerStats, nonStrikerStats, bowlerStats, crr, currentOver, teamA, teamB } = props;
    const [sticker, setSticker] = useState<BallEvent | null>(null);
  
    useEffect(() => {
        if (currentOver.length > 0) {
            const lastBall = currentOver[currentOver.length - 1];
            if (lastBall.event === '4' || lastBall.event === '6' || lastBall.event === 'W') {
                setSticker(lastBall.event);
                const timer = setTimeout(() => setSticker(null), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentOver]);

    if (theme.startsWith('elite-')) {
        return <EliteBroadcastLayout {...props} sticker={sticker} />;
    }

    const styles = themes[theme] || themes['midnight-pro'];
    if (!battingTeam || !bowlingTeam || !currentInnings || !teamA || !teamB) {
        return <div className="w-full h-full bg-transparent" />;
    }
    const { score, wickets, overs, balls, target } = currentInnings;

    return (
        <div className="w-full h-full bg-transparent p-2 flex flex-col justify-end font-sans relative">
            {sticker && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 animate-pop-in-out rounded-lg">
                    <span className={`font-black text-white ${sticker === 'W' ? 'text-red-500 text-8xl md:text-9xl' : 'text-green-400 text-8xl md:text-9xl'}`} style={{ textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                        {sticker === 'W' ? 'OUT!' : sticker}
                    </span>
                </div>
            )}
            <div className={`rounded-lg shadow-2xl p-3 border ${styles.container}`} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.75)' }}>
                 <div className={`flex items-center justify-between font-bold text-base tracking-wide border-b pb-2 mb-2 ${styles.header}`}>
                    <div className="flex items-center gap-3">
                        {teamA.logoUrl && <img src={teamA.logoUrl} alt={teamA.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20" />}
                        <span className="truncate max-w-[20ch]">{teamA.name}</span>
                    </div>
                    <span className={`opacity-80 text-sm px-2`}>VS</span>
                    <div className="flex items-center gap-3 flex-row-reverse">
                         {teamB.logoUrl && <img src={teamB.logoUrl} alt={teamB.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20" />}
                        <span className="truncate max-w-[20ch]">{teamB.name}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 items-center">
                    <div className="text-left space-y-1">
                        <h4 className={`font-bold text-xs tracking-wider ${styles.playerSectionHeaderText}`}>BATSMEN</h4>
                        <div className="flex items-baseline justify-between text-base">
                            <p className={`font-semibold truncate max-w-[15ch] text-sm ${styles.playerNameText}`}>{striker?.name || '...'}*</p>
                            <p className={`font-bold text-sm ${styles.playerStatsText}`}>{strikerStats.runs} <span className="font-normal text-xs opacity-80">({strikerStats.balls})</span></p>
                        </div>
                        <div className="flex items-baseline justify-between text-base">
                            <p className={`font-semibold truncate max-w-[15ch] text-sm ${styles.playerNameText}`}>{nonStriker?.name || '...'}</p>
                            <p className={`font-bold text-sm ${styles.playerStatsText}`}>{nonStrikerStats.runs} <span className="font-normal text-xs opacity-80">({nonStrikerStats.balls})</span></p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`flex items-center justify-center gap-2 text-base font-bold uppercase tracking-wider mb-1 text-sm ${styles.playerNameText}`}>
                            {battingTeam.logoUrl && <img src={battingTeam.logoUrl} alt={battingTeam.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20" />}
                            <span className="text-sm">{battingTeam.name}</span>
                        </div>
                        <p className={`text-5xl font-black tracking-tighter ${styles.scoreText}`}>{score}-{wickets}</p>
                        <p className={`text-xl font-bold ${styles.oversText}`}>({overs}.{balls})</p>
                        {target ? (
                            <p className={`text-sm font-black mt-1 ${styles.targetText}`}>TARGET: {target}</p>
                        ) : (
                            <p className={`text-sm font-semibold mt-1 ${styles.crrText}`}>CRR: {crr}</p>
                        )}
                    </div>
                    <div className="text-right space-y-1">
                        <h4 className={`font-bold text-xs tracking-wider ${styles.playerSectionHeaderText}`}>BOWLER</h4>
                        <div className="text-base">
                            <p className={`font-semibold truncate text-sm ${styles.playerNameText}`}>{bowler?.name || '...'}</p>
                            {bowlerStats && <p className={`font-bold text-sm ${styles.playerStatsText}`}>{bowlerStats.wickets}-{bowlerStats.runs} <span className="font-normal text-xs opacity-80">({bowlerStats.overs}.{bowlerStats.balls})</span></p>}
                        </div>
                        <div className="flex space-x-1 justify-end mt-1">
                            {currentOver.map((ball, index) => <BallDisplay key={index} event={ball.event} styles={styles} />)}
                            {Array.from({ length: 6 - currentOver.length }).map((_, index) => <div key={index} className={`w-6 h-6 rounded-full border ${styles.ballUpcoming}`} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreboardDisplay;