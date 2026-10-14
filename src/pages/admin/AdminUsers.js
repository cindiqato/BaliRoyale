import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'guest',
  });

  const [editUser, setEditUser] = useState(null);

  const loadUsers = () => {
    api.get('/getUsers')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/createUser', createForm);
      setMessage('User created.');
      setCreateForm({
        firstName: '', lastName: '', email: '', password: '',
        phone: '', address: '', role: 'guest',
      });
      setShowCreate(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.put(`/updateUser/${editUser._id}`, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        phone: editUser.phone,
        address: editUser.address,
        role: editUser.role,
        status: editUser.status,
      });
      setMessage('User updated.');
      setEditUser(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/deleteUser/${id}`);
      setMessage('User deactivated.');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deactivate');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>Manage Users</h1>

      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <p style={{ textAlign: 'center' }}>
        <button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ Create New User'}
        </button>
      </p>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
          <p>
            <input
              placeholder="First Name"
              value={createForm.firstName}
              onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </p>
          <p>
            <input
              placeholder="Last Name"
              value={createForm.lastName}
              onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </p>
          <p>
            <input
              type="email"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </p>
          <p>
            <input
              type="password"
              placeholder="Password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </p>
          <p>
            <input
              placeholder="Phone (optional)"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              style={{ width: '100%', padding: '8px' }}
            />
          </p>
          <p>
            <input
              placeholder="Address (optional)"
              value={createForm.address}
              onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
              style={{ width: '100%', padding: '8px' }}
            />
          </p>
          <p>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              style={{ padding: '8px' }}
            >
              <option value="guest">Guest</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </p>
          <button type="submit">Create</button>
        </form>
      )}

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

      {!loading && users.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>No users found.</p>
      )}

      {users.map((u) => (
        <div key={u._id} style={{ border: '1px solid #ddd', background: '#fff', padding: '15px', marginBottom: '10px' }}>
          <p style={{ margin: '0 0 5px 0' }}>
            <strong>{u.firstName} {u.lastName}</strong> — {u.email}
          </p>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
            Role: <strong>{u.role}</strong> • Status: {u.status}
            {u.isArchived && ' • Archived'}
          </p>
          <button onClick={() => setEditUser(u)} style={{ marginRight: '8px' }}>Edit</button>
          <button onClick={() => deactivate(u._id)}>Deactivate</button>
        </div>
      ))}

      {editUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <form onSubmit={handleUpdate} style={{ background: '#fff', padding: '20px', minWidth: '400px' }}>
            <h3>Edit User</h3>
            <p>
              <input
                placeholder="First Name"
                value={editUser.firstName}
                onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </p>
            <p>
              <input
                placeholder="Last Name"
                value={editUser.lastName}
                onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </p>
            <p>
              <input
                placeholder="Phone"
                value={editUser.phone || ''}
                onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </p>
            <p>
              <input
                placeholder="Address"
                value={editUser.address || ''}
                onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </p>
            <p>
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                style={{ padding: '8px', marginRight: '10px' }}
              >
                <option value="guest">Guest</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={editUser.status}
                onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                style={{ padding: '8px' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </p>
            <p>
              <button type="submit" style={{ marginRight: '8px' }}>Save</button>
              <button type="button" onClick={() => setEditUser(null)}>Cancel</button>
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;