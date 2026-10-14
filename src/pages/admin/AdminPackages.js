import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = {
  name: '',
  description: '',
  scheduleType: 'Day Tour',
  dayType: 'Any',
  startTime: '9AM',
  endTime: '5PM',
  baseRate: '',
  includedPax: 10,
  maxPax: 20,
  excessPaxRate: 350,
  bedrooms: 1,
  amenities: '',
  inclusions: '',
};

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editPkg, setEditPkg] = useState(null);

  const loadPackages = () => {
    api.get('/packages')
      .then((res) => setPackages(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load packages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const prepareBody = (f) => ({
    ...f,
    baseRate: Number(f.baseRate),
    includedPax: Number(f.includedPax),
    maxPax: Number(f.maxPax),
    excessPaxRate: Number(f.excessPaxRate),
    bedrooms: Number(f.bedrooms),
    amenities: f.amenities ? f.amenities.split(',').map((s) => s.trim()).filter(Boolean) : [],
    inclusions: f.inclusions ? f.inclusions.split(',').map((s) => s.trim()).filter(Boolean) : [],
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/packages', prepareBody(form));
      setMessage('Package created.');
      setForm(emptyForm);
      setShowCreate(false);
      loadPackages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create package');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.put(`/packages/${editPkg._id}`, prepareBody(editPkg));
      setMessage('Package updated.');
      setEditPkg(null);
      loadPackages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update package');
    }
  };

  const archive = async (id) => {
    if (!window.confirm('Archive this package?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/packages/${id}`);
      setMessage('Package archived.');
      loadPackages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to archive');
    }
  };

  const renderFormFields = (data, setData) => (
    <>
      <p><input placeholder="Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></p>
      <p><input placeholder="Description" value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} style={{ width: '100%', padding: '8px' }} /></p>
      <p>
        <select value={data.scheduleType} onChange={(e) => setData({ ...data, scheduleType: e.target.value })} style={{ padding: '8px', marginRight: '10px' }}>
          <option>Day Tour</option>
          <option>Night Tour</option>
          <option>21 Hours</option>
        </select>
        <select value={data.dayType} onChange={(e) => setData({ ...data, dayType: e.target.value })} style={{ padding: '8px' }}>
          <option>Any</option>
          <option>Weekday</option>
          <option>Weekend</option>
        </select>
      </p>
      <p>
        <input placeholder="Start time" value={data.startTime} onChange={(e) => setData({ ...data, startTime: e.target.value })} style={{ padding: '8px', marginRight: '10px' }} />
        <input placeholder="End time" value={data.endTime} onChange={(e) => setData({ ...data, endTime: e.target.value })} style={{ padding: '8px' }} />
      </p>
      <p>
        <input type="number" placeholder="Base Rate" value={data.baseRate} onChange={(e) => setData({ ...data, baseRate: e.target.value })} required style={{ padding: '8px', marginRight: '10px' }} />
        <input type="number" placeholder="Bedrooms" value={data.bedrooms} onChange={(e) => setData({ ...data, bedrooms: e.target.value })} style={{ padding: '8px' }} />
      </p>
      <p>
        <input type="number" placeholder="Included Pax" value={data.includedPax} onChange={(e) => setData({ ...data, includedPax: e.target.value })} style={{ padding: '8px', marginRight: '10px' }} />
        <input type="number" placeholder="Max Pax" value={data.maxPax} onChange={(e) => setData({ ...data, maxPax: e.target.value })} required style={{ padding: '8px', marginRight: '10px' }} />
        <input type="number" placeholder="Excess Rate" value={data.excessPaxRate} onChange={(e) => setData({ ...data, excessPaxRate: e.target.value })} style={{ padding: '8px' }} />
      </p>
      <p><input placeholder="Amenities (comma-separated)" value={data.amenities} onChange={(e) => setData({ ...data, amenities: e.target.value })} style={{ width: '100%', padding: '8px' }} /></p>
      <p><input placeholder="Inclusions (comma-separated)" value={data.inclusions} onChange={(e) => setData({ ...data, inclusions: e.target.value })} style={{ width: '100%', padding: '8px' }} /></p>
    </>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>Manage Packages</h1>

      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <p style={{ textAlign: 'center' }}>
        <button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ Create New Package'}
        </button>
      </p>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
          {renderFormFields(form, setForm)}
          <button type="submit">Create</button>
        </form>
      )}

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

      {packages.map((p) => (
        <div key={p._id} style={{ border: '1px solid #ddd', background: '#fff', padding: '15px', marginBottom: '10px' }}>
          <p style={{ margin: '0 0 5px 0' }}><strong>{p.name}</strong> — ₱{p.baseRate.toLocaleString()}</p>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
            {p.startTime} – {p.endTime} • Included: {p.includedPax} • Max: {p.maxPax}
          </p>
          <button onClick={() => setEditPkg({ ...p, amenities: (p.amenities || []).join(', '), inclusions: (p.inclusions || []).join(', ') })} style={{ marginRight: '8px' }}>Edit</button>
          <button onClick={() => archive(p._id)}>Archive</button>
        </div>
      ))}

      {editPkg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, overflow: 'auto' }}>
          <form onSubmit={handleUpdate} style={{ background: '#fff', padding: '20px', minWidth: '400px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3>Edit Package</h3>
            {renderFormFields(editPkg, setEditPkg)}
            <p>
              <button type="submit" style={{ marginRight: '8px' }}>Save</button>
              <button type="button" onClick={() => setEditPkg(null)}>Cancel</button>
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;