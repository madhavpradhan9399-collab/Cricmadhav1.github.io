import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Team, Player, PlayerRole } from '../types';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

const TeamPanel: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { getTournament, getTeam, createTeam, addPlayerToTeam, updateTeam } = useAppContext();
  
  const tournament = useMemo(() => tournamentId ? getTournament(tournamentId) : undefined, [getTournament, tournamentId]);
  const tournamentTeams = useMemo(() => tournament?.teams.map(id => getTeam(id)).filter((t): t is Team => !!t) || [], [tournament, getTeam]);
  
  // State for Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // State for Data
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  // State for Forms
  const [newTeam, setNewTeam] = useState<Omit<Team, 'id' | 'players'>>({ name: '', logoUrl: '' });
  const [editedTeamData, setEditedTeamData] = useState<Partial<Omit<Team, 'id' | 'players'>>>({ name: '', logoUrl: ''});
  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({ name: '', role: PlayerRole.BATSMAN });


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setLogo: (logo: string) => void) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please select a JPG or PNG file.');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if(tournamentId) {
      await createTeam(tournamentId, newTeam);
    }
    setIsTeamModalOpen(false);
    setNewTeam({ name: '', logoUrl: '' });
  };
  
  const handleOpenEditModal = (team: Team) => {
    setEditingTeam(team);
    setEditedTeamData({ name: team.name, logoUrl: team.logoUrl });
    setIsEditModalOpen(true);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if(editingTeam) {
        await updateTeam(editingTeam.id, editedTeamData);
    }
    setIsEditModalOpen(false);
    setEditingTeam(null);
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedTeamId) {
      await addPlayerToTeam(selectedTeamId, newPlayer);
    }
    setIsPlayerModalOpen(false);
    setNewPlayer({ name: '', role: PlayerRole.BATSMAN });
  };

  if (!tournament) {
    return <Layout title="Error"><p>Tournament not found.</p></Layout>;
  }

  return (
    <Layout title={`Team Management: ${tournament.name}`} backLink={{ to: '/', text: 'Back to Dashboard' }}>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsTeamModalOpen(true)}
          className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-all shadow-lg"
        >
          ➕ Add Team
        </button>
      </div>

      <div className="space-y-8">
        {tournamentTeams.length > 0 ? tournamentTeams.map(team => (
          <div key={team.id} className="bg-secondary p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                  {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-accent"/>
                  ) : (
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-black text-2xl text-highlight shrink-0">
                          {team.name.charAt(0)}
                      </div>
                  )}
                  <h3 className="text-2xl font-bold text-white">{team.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                 <button
                    onClick={() => handleOpenEditModal(team)}
                    className="bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { setSelectedTeamId(team.id); setIsPlayerModalOpen(true); }}
                    className="bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Add Player
                  </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {team.players.map(player => (
                <div key={player.id} className="bg-primary p-3 rounded-lg text-center">
                  <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xl">{player.name.slice(0, 2)}</div>
                  <p className="font-semibold text-text-main text-sm">{player.name}</p>
                  <p className="text-xs text-text-secondary">{player.role}</p>
                </div>
              ))}
              {team.players.length === 0 && <p className="text-text-secondary col-span-full">No players added yet.</p>}
            </div>
          </div>
        )) : (
          <div className="text-center py-12 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold">No teams found.</h3>
            <p className="text-text-secondary mt-2">Click "Add Team" to get started!</p>
          </div>
        )}
      </div>

      {/* Add Team Modal */}
      <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title="Add New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <input type="text" name="name" value={newTeam.name} onChange={(e) => setNewTeam(t => ({...t, name: e.target.value}))} placeholder="Team Name" className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Team Logo (JPG/PNG)</label>
            <input type="file" accept="image/jpeg, image/png" onChange={(e) => handleFileChange(e, (logo) => setNewTeam(t => ({...t, logoUrl: logo})))} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-highlight file:text-primary hover:file:bg-teal-300"/>
            {newTeam.logoUrl && <img src={newTeam.logoUrl} alt="Logo Preview" className="w-24 h-24 rounded-full object-cover mt-4 ring-2 ring-accent mx-auto"/>}
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-colors">Add Team</button>
          </div>
        </form>
      </Modal>

      {/* Edit Team Modal */}
       <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${editingTeam?.name}`}>
        <form onSubmit={handleUpdateTeam} className="space-y-4">
          <input type="text" name="name" value={editedTeamData.name} onChange={(e) => setEditedTeamData(t => ({...t, name: e.target.value}))} placeholder="Team Name" className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Team Logo (JPG/PNG)</label>
            <input type="file" accept="image/jpeg, image/png" onChange={(e) => handleFileChange(e, (logo) => setEditedTeamData(t => ({...t, logoUrl: logo})))} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-highlight file:text-primary hover:file:bg-teal-300"/>
            {editedTeamData.logoUrl && <img src={editedTeamData.logoUrl} alt="Logo Preview" className="w-24 h-24 rounded-full object-cover mt-4 ring-2 ring-accent mx-auto"/>}
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-colors">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Add Player Modal */}
      <Modal isOpen={isPlayerModalOpen} onClose={() => setIsPlayerModalOpen(false)} title="Add New Player">
        <form onSubmit={handleAddPlayer} className="space-y-4">
          <input type="text" name="name" value={newPlayer.name} onChange={(e) => setNewPlayer(p => ({...p, name: e.target.value}))} placeholder="Player Name" className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <select name="role" value={newPlayer.role} onChange={(e) => setNewPlayer(p => ({...p, role: e.target.value as PlayerRole}))} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight">
            {Object.values(PlayerRole).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-colors">Add Player</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default TeamPanel;
