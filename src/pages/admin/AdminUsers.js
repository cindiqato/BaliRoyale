
import { useEffect, useState } from 'react';
import api from '../../api/axios';

// BALIROYALE COLORS
const C = {
  cream: '#F4F1EA',
  green: '#3A4D39',
  medium: '#4F6F52',
  pink: '#F2DCD5',
  white: '#FAFAF8',
  gray: '#8A7A68',
  brown: '#6E5A48',
  border: '#C4BBAF',
};

// REUSABLE INLINE STYLES
const s = {
  page: {
    minHeight: '100vh', background: C.cream,
    padding: '45px 30px', fontFamily: 'Arial, sans-serif',
    color: '#333', boxSizing: 'border-box',
  },
  container: { maxWidth: 1100, margin: '0 auto' },
  row: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 20,
  },
  title: {
    color: C.green, fontSize: 32, margin: '12px 0 8px',
  },
  muted: { color: C.gray, fontSize: 13, margin: 0 },
  count: {
    background: C.green, color: C.white,
    padding: '18px 28px', borderRadius: 12,
    minWidth: 150, display: 'flex',
    flexDirection: 'column', gap: 8,
  },
  panel: {
    background: C.white, border: `1px solid ${C.border}`,
    borderRadius: 16, padding: 28,
    boxShadow: '0 5px 25px rgba(58,77,57,.06)',
  },
  card: {
    background: C.white, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: 22,
  },
  avatar: {
    width: 46, height: 46, flexShrink: 0,
    background: C.pink, color: C.green,
    borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 700,
  },
  badge: {
    background: C.cream, color: C.medium,
    padding: '6px 12px', borderRadius: 6,
    fontSize: 11, fontWeight: 700,
    textTransform: 'capitalize',
  },
  button: {
    background: C.medium, color: C.white,
    border: 'none', borderRadius: 8,
    padding: '12px 20px', fontSize: 13,
    fontWeight: 700, cursor: 'pointer',
  },
  secondary: {
    background: C.cream, color: C.green,
    border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '10px 22px',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  danger: {
    background: C.pink, color: C.brown,
    border: 'none', borderRadius: 8,
    padding: '10px 22px', fontSize: 13,
    fontWeight: 700, cursor: 'pointer',
  },
  form: {
    background: C.cream, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: 24, marginBottom: 24,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 17, marginBottom: 22,
  },
  field: {
    display: 'flex', flexDirection: 'column',
    gap: 7, minWidth: 0,
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px', border: `1px solid ${C.border}`,
    borderRadius: 8, background: C.white,
    color: '#333', fontSize: 14,
  },
  label: { color: C.green, fontSize: 12, fontWeight: 700 },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(17,17,17,.55)',
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 100,
    padding: 20, overflowY: 'auto',
    boxSizing: 'border-box',
  },
  modal: {
    background: C.white, borderRadius: 16,
    padding: 28, width: '100%', maxWidth: 650,
    maxHeight: '90vh', overflowY: 'auto',
    boxSizing: 'border-box',
    boxShadow: '0 20px 60px rgba(0,0,0,.2)',
  },
};

// REUSABLE FORM FIELD
const Field = ({ label, value, onChange, type = 'text', required = false }) => (
  <div style={s.field}>
    <label style={s.label}>{label}</label>
    <input
      type={type}
      placeholder={label}
      value={value || ''}
      onChange={onChange}
      required={required}
      style={s.input}
    />
  </div>
);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const emptyForm = {
    firstName: '', lastName: '', email: '',
    password: '', phone: '', address: '', role: 'guest',
  };

  const [createForm, setCreateForm] = useState(emptyForm);

  const loadUsers = () => {
    api.get('/getUsers')
      .then(res => setUsers(res.data))
      .catch(err => setError(
        err.response?.data?.error || 'Failed to load users'
      ))
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
      setCreateForm({ ...emptyForm });
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

  // CREATE FORM FIELDS
  const createFields = [
    ['firstName', 'First Name', 'text', true],
    ['lastName', 'Last Name', 'text', true],
    ['email', 'Email', 'email', true],
    ['password', 'Password', 'password', true],
    ['phone', 'Phone (Optional)', 'text', false],
    ['address', 'Address (Optional)', 'text', false],
  ];

  // EDIT FORM FIELDS
  const editFields = [
    ['firstName', 'First Name'],
    ['lastName', 'Last Name'],
    ['phone', 'Phone'],
    ['address', 'Address'],
  ];

  const roleOptions = ['guest', 'staff', 'admin'];

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* HEADER */}
        <div style={{ ...s.row, marginBottom: 32 }}>
          <div>
            <span style={{
              color: C.gray, fontSize: 11,
              fontWeight: 700, letterSpacing: 2,
            }}>
              BALIROYALE / ADMINISTRATION
            </span>
            <h1 style={s.title}>Manage Users</h1>
            <p style={{ ...s.muted, fontSize: 14 }}>
              View, create and manage system users.
            </p>
          </div>

          <div style={s.count}>
            <span style={{ color: C.pink, fontSize: 12 }}>
              Total Users
            </span>
            <strong style={{ fontSize: 30 }}>{users.length}</strong>
          </div>
        </div>

        {/* MESSAGES */}
        {message && (
          <p style={{
            background: '#E8EFE5', color: C.green,
            padding: 14, borderRadius: 8,
          }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{
            background: C.pink, color: '#A13E3E',
            padding: 14, borderRadius: 8,
          }}>
            {error}
          </p>
        )}

        {/* MAIN PANEL */}
        <div style={s.panel}>
          <div style={{
            ...s.row, paddingBottom: 22, marginBottom: 22,
            borderBottom: `1px solid ${C.pink}`,
          }}>
            <div>
              <h2 style={{
                color: C.green, fontSize: 20, margin: '0 0 6px',
              }}>
                User Directory
              </h2>
              <p style={s.muted}>Manage registered accounts</p>
            </div>

            <button
              style={s.button}
              onClick={() => setShowCreate(!showCreate)}
            >
              {showCreate ? 'Cancel' : '+ Create New User'}
            </button>
          </div>

          {/* CREATE USER */}
          {showCreate && (
            <form onSubmit={handleCreate} style={s.form}>
              <h3 style={{ color: C.green, margin: '0 0 24px' }}>
                Create New User
              </h3>

              <div style={s.grid}>
                {createFields.map(([key, label, type, required]) => (
                  <Field
                    key={key}
                    label={label}
                    type={type}
                    required={required}
                    value={createForm[key]}
                    onChange={e => setCreateForm({
                      ...createForm, [key]: e.target.value,
                    })}
                  />
                ))}

                <div style={s.field}>
                  <label style={s.label}>Role</label>
                  <select
                    style={s.input}
                    value={createForm.role}
                    onChange={e => setCreateForm({
                      ...createForm, role: e.target.value,
                    })}
                  >
                    {roleOptions.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" style={s.button}>Create</button>
            </form>
          )}

          {loading && (
            <p style={{ ...s.muted, textAlign: 'center', padding: 45 }}>
              Loading...
            </p>
          )}

          {!loading && users.length === 0 && (
            <div style={{ textAlign: 'center', padding: 45 }}>
              <h3 style={{ color: C.green }}>No users found</h3>
              <p style={s.muted}>No users found.</p>
            </div>
          )}

          {/* USER CARDS */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            {users.map(u => (
              <div key={u._id} style={s.card}>

                <div style={{ ...s.row, gap: 16 }}>
                  <div style={s.avatar}>
                    {u.firstName?.charAt(0)}
                    {u.lastName?.charAt(0)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      color: C.green, fontSize: 16, margin: '0 0 6px',
                    }}>
                      {u.firstName} {u.lastName}
                    </h3>
                    <p style={{ ...s.muted, overflowWrap: 'anywhere' }}>
                      {u.email}
                    </p>
                  </div>

                  <span style={s.badge}>{u.role}</span>
                </div>

                <div style={{
                  ...s.row, marginTop: 18, paddingTop: 18,
                  borderTop: `1px solid ${C.pink}`, gap: 16,
                }}>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap',
                    gap: 12, color: C.brown, fontSize: 12,
                  }}>
                    <span>Role: <strong>{u.role}</strong></span>
                    <span>Status: {u.status}</span>
                    {u.isArchived && <span>Archived</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      style={s.secondary}
                      onClick={() => setEditUser(u)}
                    >
                      Edit
                    </button>
                    <button
                      style={s.danger}
                      onClick={() => deactivate(u._id)}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EDIT USER MODAL */}
        {editUser && (
          <div style={s.overlay}>
            <form onSubmit={handleUpdate} style={s.modal}>
              <h3 style={{
                color: C.green, fontSize: 20, margin: '0 0 24px',
              }}>
                Edit User
              </h3>

              <div style={s.grid}>
                {editFields.map(([key, label]) => (
                  <Field
                    key={key}
                    label={label}
                    value={editUser[key]}
                    onChange={e => setEditUser({
                      ...editUser, [key]: e.target.value,
                    })}
                  />
                ))}

                <div style={s.field}>
                  <label style={s.label}>Role</label>
                  <select
                    style={s.input}
                    value={editUser.role}
                    onChange={e => setEditUser({
                      ...editUser, role: e.target.value,
                    })}
                  >
                    {roleOptions.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Status</label>
                  <select
                    style={s.input}
                    value={editUser.status}
                    onChange={e => setEditUser({
                      ...editUser, status: e.target.value,
                    })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: 10,
              }}>
                <button type="submit" style={s.button}>Save</button>
                <button
                  type="button"
                  style={s.secondary}
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminUsers;
