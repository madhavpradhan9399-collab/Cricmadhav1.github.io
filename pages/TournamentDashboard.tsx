import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Tournament, MatchFormat } from '../types';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

const TournamentDashboard: React.FC = () => {
  const { tournaments, createTournament, deleteTournament, loginId, logout } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTournament, setNewTournament] = useState<Omit<Tournament, 'id' | 'teams' | 'matches' | 'createdAt'>>({
    name: '',
    organizer: '',
    format: MatchFormat.T20,
    startDate: '',
    endDate: '',
    location: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTournament(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTournament(newTournament);
    setIsModalOpen(false);
    setNewTournament({ name: '', organizer: '', format: MatchFormat.T20, startDate: '', endDate: '', location: '' });
  };

  return (
    <Layout title="Tournament Dashboard">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="bg-secondary p-2 rounded-lg">
            <span className="text-sm text-text-secondary mr-2">Scorebook ID:</span>
            <span className="font-mono bg-accent px-2 py-1 rounded-md text-highlight text-sm">{loginId}</span>
        </div>
        <div className="flex gap-2 justify-end">
            <button
              onClick={logout}
              className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-all shadow-lg"
            >
              Switch Scorebook
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-all shadow-lg"
            >
              ➕ Create Tournament
            </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.length > 0 ? tournaments.map(tourn => {
          return (
            <div key={tourn.id} className="bg-secondary p-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between">
              <div>
                 <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-black text-2xl text-highlight mr-4 shrink-0">
                      {tourn.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{tourn.name}</h2>
                      <p className="text-sm text-text-secondary">{tourn.organizer}</p>
                    </div>
                  </div>
                   <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteTournament(tourn.id);
                    }} 
                    className="text-gray-500 hover:text-red-400 font-bold text-2xl leading-none ml-2"
                    aria-label={`Delete ${tourn.name}`}
                    title="Delete Tournament"
                  >
                    &times;
                  </button>
                </div>
                <div className="text-sm space-y-2 text-text-secondary">
                  <p><span className="font-semibold text-text-main">Format:</span> {tourn.format}</p>
                  <p><span className="font-semibold text-text-main">Dates:</span> {tourn.startDate} to {tourn.endDate}</p>
                  <p><span className="font-semibold text-text-main">Location:</span> {tourn.location}</p>
                  <p><span className="font-semibold text-text-main">Teams:</span> {tourn.teams.length}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Link to={`/tournament/${tourn.id}/teams`} className="text-center bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                  Manage Teams
                </Link>
                <Link to={`/tournament/${tourn.id}/fixtures`} className="text-center bg-highlight text-primary font-bold py-2 px-4 rounded-lg hover:bg-teal-300 transition-colors text-sm">
                  Manage Fixtures
                </Link>
              </div>
            </div>
          )
        }) : (
          <div className="col-span-full text-center py-12 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold">No tournaments found.</h3>
            <p className="text-text-secondary mt-2">Click "Create Tournament" to get started!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Tournament">
        <form onSubmit={handleCreateTournament} className="space-y-4">
          <input type="text" name="name" value={newTournament.name} onChange={handleInputChange} placeholder="Tournament Name" className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <input type="text" name="organizer" value={newTournament.organizer} onChange={handleInputChange} placeholder="Organizer" className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <select name="format" value={newTournament.format} onChange={handleInputChange} className="w-full bg-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-highlight">
            {Object.values(MatchFormat).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <input type="text" name="location" value={newTournament.location} onChange={handleInputChange} placeholder="Location" className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight" required />
          <div className="flex gap-4">
            <div className="w-1/2">
                <label htmlFor="startDate" className="text-sm text-text-secondary mb-1 block">Start Date</label>
                <input id="startDate" type="date" name="startDate" value={newTournament.startDate} onChange={handleInputChange} className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight" required />
            </div>
            <div className="w-1/2">
                <label htmlFor="endDate" className="text-sm text-text-secondary mb-1 block">End Date</label>
                <input id="endDate" type="date" name="endDate" value={newTournament.endDate} onChange={handleInputChange} className="w-full bg-accent p-3 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight" required />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-highlight text-primary font-bold py-2 px-6 rounded-lg hover:bg-teal-300 transition-colors">Create</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default TournamentDashboard;