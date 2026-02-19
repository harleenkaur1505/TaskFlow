import { useState, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import { updateProfile } from '../../api/authApi';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';

function Profile() {
  const { user, dispatch } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const hasChanges = name !== user?.name;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!hasChanges && !fileInputRef.current?.files?.length) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);

      if (fileInputRef.current?.files?.[0]) {
        formData.append('avatar', fileInputRef.current.files[0]);
      }

      const updatedUser = await updateProfile(formData);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (n) => {
    if (!n) return '?';
    return n.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Profile</h1>
          <p className={styles.pageSubtitle}>Manage your account settings</p>
        </div>

        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <button
              className={styles.avatarCircle}
              onClick={handleAvatarClick}
              type="button"
              aria-label="Change avatar"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarInitials}>{getInitials(user?.name)}</span>
              )}
              <div className={styles.avatarOverlay}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2.5 11.5V13.5H4.5L11.5 6.5L9.5 4.5L2.5 11.5Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M9.5 4.5L11.5 6.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.fileInput}
              onChange={() => {
                if (fileInputRef.current?.files?.[0]) {
                  handleSave(new Event('submit'));
                }
              }}
            />
            <div className={styles.avatarInfo}>
              <span className={styles.avatarName}>{user?.name}</span>
              <span className={styles.avatarEmail}>{user?.email}</span>
              <span className={styles.avatarHint}>Click avatar to upload photo (JPG, PNG under 5MB)</span>
            </div>
          </div>

          <div className={styles.divider} />

          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="profile-name">Display name</label>
              <input
                id="profile-name"
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                maxLength={50}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="profile-email">Email address</label>
              <input
                id="profile-email"
                className={`${styles.input} ${styles.inputReadonly}`}
                type="email"
                value={user?.email || ''}
                readOnly
              />
              <span className={styles.fieldHint}>Email cannot be changed</span>
            </div>

            <div className={styles.formActions}>
              <button
                className={styles.saveBtn}
                type="submit"
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Profile;
