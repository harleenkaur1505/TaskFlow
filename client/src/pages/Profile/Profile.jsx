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
        <div className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.subtitle}>Manage your personal information</p>
        </div>

        <div className={styles.avatarSection}>
          <div className={styles.avatarCircle}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitials}>{getInitials(user?.name)}</span>
            )}
          </div>
          <div className={styles.avatarActions}>
            <button
              className={styles.uploadBtn}
              onClick={handleAvatarClick}
              type="button"
            >
              Upload photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.fileInput}
              onChange={() => {
                // Trigger save with new avatar
                if (fileInputRef.current?.files?.[0]) {
                  handleSave(new Event('submit'));
                }
              }}
            />
            <span className={styles.uploadHint}>JPG, PNG under 5MB</span>
          </div>
        </div>

        <div className={styles.divider} />

        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-name">Name</label>
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
            <label className={styles.label} htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              className={`${styles.input} ${styles.inputReadonly}`}
              type="email"
              value={user?.email || ''}
              readOnly
            />
          </div>

          <button
            className={styles.saveBtn}
            type="submit"
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </>
  );
}

export default Profile;
