import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Team, Match } from '../types';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

const FixturePanel: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { getTournament, getTeam, getMatch, createMatch, matches } = useAppContext();

  const tournament = useMemo(() => tournamentId ? getTournament(tournamentId) : undefined, [getTournament, tournamentId]);
  const tournamentTeams = useMemo(() => tournament?.teams.map(id => getTeam(id)).filter((t): t is Team => !!t) || [], [tournament, getTeam]);
  const tournamentMatches = useMemo(() => tournament?.matches.map(id => getMatch(id)).filter((m): m is Match => !!m) || [], [tournament, getMatch, matches]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [tossWinnerId, setTossWinnerId] = useState('');
  const [decision, setDecision] = useState<'bat' | 'bowl'>('bat');


  const handleCreateFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tournamentId && teamAId && teamBId && teamAId !== teamBId && tossWinnerId && decision) {
      await createMatch(tournamentId, teamAId, teamBId, tossWinnerId, decision);
      setIsModalOpen(false);
      setTeamAId('');
      setTeamBId('');
      setTossWinnerId('');
      setDecision('bat');
    } else {
        alert("Please select two different teams and the toss outcome.");
    }
  };
  
  const resetForm = () => {
    setIsModalOpen(false);
    setTeamAId('');
    setTeamBId('');
    setTossWinnerId('');
    setDecision('bat');
  };

  if (!tournament) {
    return <Layout title="Error"><p>Tournament not found.</p></Layout>;
  }
  
  const availableTossTeams = tournamentTeams.filter(t => t.id === teamAId || t.id === teamBId);

  return (
    <Layout title={`Fixtures: ${tournament.name}`} backLink={{ to: '/', text: 'Back to Dashboard' }}>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={tournamentTeams.length < 2}
          className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-all shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          ➕ Create Fixture
        </button>
      </div>

      <div className="bg-secondary p-6 rounded-lg shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-4">Match List</h3>
        <div className="space-y-4">
          {tournamentMatches.length > 0 ? tournamentMatches.map(match => {
            const teamA = getTeam(match.teamAId);
            const teamB = getTeam(match.teamBId);
            const tossWinner = getTeam(match.tossWinnerId);
            return (
              <div key={match.id} className="bg-primary p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <p className="font-bold text-lg text-white">{teamA?.name || 'Team A'} vs {teamB?.name || 'Team B'}</p>
                   <p className="text-xs text-text-secondary">Toss: {tossWinner?.name} won and chose to {match.decision}.</p>
                  <p className="text-sm text-text-secondary mt-1">Status: <span className={`font-semibold ${match.status === 'live' ? 'text-green-400' : 'text-yellow-400'}`}>{match.status.toUpperCase()}</span></p>
                </div>
                <Link to={`/match/${match.id}/admin`} className="bg-highlight text-primary font-bold py-2 px-4 rounded-lg hover:bg-teal-300 transition-colors text-sm mt-3 sm:mt-0 self-start sm:self-center">
                  Open Scorer
                </Link>
              </div>
            );
          }) : (
            <div className="text-center py-8">
              <p className="text-text-secondary">No fixtures have been created yet.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={resetForm} title="Create New Fixture">
        <form onSubmit={handleCreateFixture} className="space-y-4">
          <div>
            <label htmlFor="teamA" className="block text-sm font-medium text-text-secondary mb-1">Team A</label>
            <select
              id="teamA"
              value={teamAId}
              onChange={(e) => setTeamAId(e.target.value)}
              className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            >
              <option value="">Select Team A</option>
              {tournamentTeams.filter(t => t.id !== teamBId).map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="teamB" className="block text-sm font-medium text-text-secondary mb-1">Team B</label>
            <select
              id="teamB"
              value={teamBId}
              onChange={(e) => setTeamBId(e.target.value)}
              className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            >
              <option value="">Select Team B</option>
              {tournamentTeams.filter(t => t.id !== teamAId).map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <hr className="border-accent" />
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tossWinner" className="block text-sm font-medium text-text-secondary mb-1">Toss Winner</label>
                <select id="tossWinner" value={tossWinnerId} onChange={(e) => setTossWinnerId(e.target.value)} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight" required disabled={!teamAId || !teamBId}>
                  <option value="">Select winner</option>
                  {availableTossTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="decision" className="block text-sm font-medium text-text-secondary mb-1">Decision</label>
                <select id="decision" value={decision} onChange={(e) => setDecision(e.target.value as 'bat' | 'bowl')} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight" required>
                  <option value="bat">Bat</option>
                  <option value="bowl">Bowl</option>
                </select>
              </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-colors">Create Fixture</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default FixturePanel;
