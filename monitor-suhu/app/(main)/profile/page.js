'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import { Badge } from 'primereact/badge';
import { useAuth } from '@/app/(auth)/context/authContext';
import { useRouter } from 'next/navigation';

import '@/styles/page/profile.scss';

const ProfilePage = () => {
  const toast = useRef(null);
  const fileUploadRef = useRef(null);
  const { user, setUser, initialized, logout, loading: authLoading} = useAuth();
  const redirectedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [originalUserInfo, setOriginalUserInfo] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logout();
      
      if (result.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Logout Berhasil',
          detail: result.message || 'Anda telah berhasil keluar dari sistem',
          life: 3000
        });

        setTimeout(() => {
          router.push('/auth/login');
        }, 1000);
      } else {
        throw new Error(result.error || 'Logout gagal');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Logout Gagal',
        detail: error.message || 'Terjadi kesalahan saat logout',
        life: 5000
      });
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (initialized && !loading && !user && !redirectedRef.current) {
      redirectedRef.current = true;
      router.push('/auth/login');
    }
  }, [initialized, loading, user, router]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    return phoneRegex.test(phone);
  };

  useEffect(() => {
    if (user && !authLoading) {
      setUserInfo(user);
      setOriginalUserInfo({ ...user });
      
      setProfileImage(user.profile_image || null);
    }
  }, [user, authLoading]);

  const showToast = (severity, summary, detail) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000
    });
  };

  const validateForm = () => {
    if (!userInfo.username?.trim()) {
      showToast('error', 'Validasi Error', 'Username tidak boleh kosong');
      return false;
    }
    
    if (!userInfo.email?.trim()) {
      showToast('error', 'Validasi Error', 'Email tidak boleh kosong');
      return false;
    }
    
    if (!isValidEmail(userInfo.email)) {
      showToast('error', 'Validasi Error', 'Format email tidak valid');
      return false;
    }
    
    if (userInfo.no_hp && !isValidPhone(userInfo.no_hp)) {
      showToast('error', 'Validasi Error', 'Format nomor telepon tidak valid');
      return false;
    }
    
    return true;
  };

  const handleImageUpload = (event) => {
    const file = event.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'Error', 'Ukuran file maksimal 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showToast('error', 'Error', 'File harus berupa gambar');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setProfileImage(base64Image);
        setUserInfo((prev) => ({
          ...prev,
          profile_image: base64Image,
        }));

        showToast(
          'success',
          'Berhasil',
          'Foto profil berhasil dipilih. Klik Simpan untuk menyimpan perubahan.'
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    confirmDialog({
      message: 'Apakah Anda yakin ingin menyimpan perubahan profil?',
      header: 'Konfirmasi',
      icon: 'pi pi-question-circle',
      acceptClassName: 'p-button-success',
      accept: async () => {
        try {
          setSaving(true);
          
          const payload = {
            id: userInfo.id,
            username: userInfo.username.trim(),
            email: userInfo.email.trim(),
            no_hp: userInfo.no_hp?.trim() || '',
            role: userInfo.role,
            profile_image: userInfo.profile_image || null
          };

          const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();
          console.log("DATA ASLI DARI SERVER CIK", result)

          if (response.ok && result.status === '00') {
            showToast('success', 'Berhasil', result.message || 'Profil berhasil diperbarui');
            setEditMode(false);
            const updatedUserFromServer = result.data;
            setUserInfo(updatedUserFromServer);
            setOriginalUserInfo({...updatedUserFromServer});
            setProfileImage(updatedUserFromServer.profile_image || null);
            setUser(updatedUserFromServer);
            console.log(setProfileImage)
          } else {
            showToast('error', 'Error', result.message || 'Gagal memperbarui profil');
          }
        } catch (error) {
          console.error('Save error:', error);
          showToast('error', 'Error', 'Terjadi kesalahan saat menyimpan data');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const handleCancelEdit = () => {
    confirmDialog({
      message: 'Apakah Anda yakin ingin membatalkan perubahan?',
      header: 'Konfirmasi',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setUserInfo({ ...originalUserInfo });
        setEditMode(false);
      }
    });
  };

  const hasChanges = () => {
    return JSON.stringify(userInfo) !== JSON.stringify(originalUserInfo);
  };

  const getRoleBadge = (role) => {
    const config = {
      superadmin: { severity: 'danger', icon: 'pi pi-crown' },
      admin: { severity: 'warning', icon: 'pi pi-shield' },
      user: { severity: 'info', icon: 'pi pi-user' }
    };
    return config[role] || config.user;
  };

  if (authLoading || !user) {
    return (
      <div className="profile-loading">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
        <p>{authLoading ? 'Memuat data autentikasi...' : 'Memuat data profil...'}</p>
      </div>
    );
  }
  console.log('NILAI STATE PROFILE IMAGE:', profileImage);

  return (
    // ✅ WRAPPER CONTAINER
    <div className="profile-page-container">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      {/* ✅ HEADER SECTION */}
      <div className="profile-header">
        <div className="header-content">
          <div className="header-text">
            <h3>Profil Pengguna</h3>
            <p>Kelola informasi profil dan keamanan akun Anda</p>
          </div>
          <div className="header-actions">
            {editMode && (
              <Button 
                icon="pi pi-times" 
                label="Batal" 
                onClick={handleCancelEdit}
                className="p-button-secondary" 
                disabled={saving}
              />
            )}
            <Button 
              icon={editMode ? "pi pi-check" : "pi pi-pencil"}
              label={editMode ? "Simpan" : "Edit Profil"}
              onClick={editMode ? handleSaveProfile : () => setEditMode(true)}
              className={editMode ? "p-button-success" : "p-button-primary"}
              loading={saving}
              disabled={saving || (editMode && !hasChanges())}
            />
          </div>
        </div>
      </div>

      {/* ✅ CARDS GRID */}
      <div className="profile-cards">
        {/* LEFT CARD - AVATAR */}
        <div className="profile-avatar-card">
          <div className="avatar-wrapper">
            <div className="avatar-container">
              <Avatar 
                image={profileImage}
                icon={!profileImage ? "pi pi-user" : null}
                size="xlarge" 
                shape="circle"
              />
              {editMode && (
                <div className="avatar-upload-btn">
                  <FileUpload
                    ref={fileUploadRef}
                    mode="basic"
                    accept="image/*"
                    maxFileSize={2000000}
                    customUpload
                    uploadHandler={handleImageUpload}
                    chooseOptions={{
                      icon: 'pi pi-camera',
                      className: 'p-button-rounded p-button-sm p-button-primary'
                    }}
                  />
                </div>
              )}
            </div>

            <h4>{userInfo.username}</h4>
            
            <Badge 
              value={userInfo.role?.toUpperCase()} 
              severity={getRoleBadge(userInfo.role).severity}
            />
          </div>

          <Divider />

          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{userInfo.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Telepon:</span>
              <span className="info-value">{userInfo.no_hp || '-'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT CARD - FORM */}
        <div className="profile-form-card">
          <h4 className="card-title">Informasi Personal</h4>

          <div className="form-grid">
            {/* Username */}
            <div className="form-field">
              <label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </label>
              <InputText 
                id="username"
                value={userInfo.username || ''}
                onChange={(e) => setUserInfo({...userInfo, username: e.target.value})}
                disabled={!editMode}
                placeholder="Masukkan username"
              />
            </div>

            {/* Email */}
            <div className="form-field">
              <label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <InputText 
                id="email"
                value={userInfo.email || ''}
                onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                disabled={!editMode}
                placeholder="nama@email.com"
                type="email"
              />
            </div>

            {/* No. Telepon */}
            <div className="form-field">
              <label htmlFor="no_hp">No. Telepon</label>
              <InputText 
                id="no_hp"
                value={userInfo.no_hp || ''}
                onChange={(e) => setUserInfo({...userInfo, no_hp: e.target.value})}
                disabled={!editMode}
                placeholder="08XXXXXXXXXX"
              />
            </div>

            {/* Role */}
            <div className="form-field">
              <label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </label>
              <InputText 
                id="role"
                value={userInfo.role || ''}
                disabled
                placeholder="Role"
              />
            </div>
          </div>

          {/* Logout Section */}
          <div className="logout-section">
            <Button
              id="logout"
              name="logout"
              label={isLoggingOut ? 'Logging out...' : 'Logout'}
              icon={isLoggingOut ? 'pi pi-spin pi-spinner' : 'pi pi-sign-out'}
              className="p-button-danger"
              loading={isLoggingOut}
              onClick={handleLogout}
              disabled={isLoggingOut}
            />
          </div>

          {/* Changes Warning */}
          {hasChanges() && editMode && (
            <div className="changes-warning">
              <i className="pi pi-info-circle"></i>
              <span>Anda memiliki perubahan yang belum disimpan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;