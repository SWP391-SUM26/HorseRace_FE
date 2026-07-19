import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { Button, Card } from '@/common/ui';
import {
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Trophy as TrophyIcon,
} from 'lucide-react';
import styles from './Settings.module.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // Form State
  const [settings, setSettings] = useState({
    platformName: 'Equine Elite',
    maintenanceMode: false,
    maxHorsesPerRace: 14,
    defaultPayoutRule: 'top_3',
    mfaEnabled: true,
    sessionTimeout: 60
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 800);
  };

  return (
    <>
      <PageHeader
        title="System Settings"
        subtitle="Configure platform-wide parameters, rules, and security policies."
        actions={
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        }
      />

      <div className={styles.settingsLayout}>
        {/* Left Navigation */}
        <div className={styles.sidebarMenu}>
          <button 
            className={`${styles.menuItem} ${activeTab === 'general' ? styles.menuItemActive : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <SettingsIcon className={styles.menuIcon} /> General Settings
          </button>
          <button 
            className={`${styles.menuItem} ${activeTab === 'race' ? styles.menuItemActive : ''}`}
            onClick={() => setActiveTab('race')}
          >
            <TrophyIcon className={styles.menuIcon} /> Race Configurations
          </button>
          <button 
            className={`${styles.menuItem} ${activeTab === 'security' ? styles.menuItemActive : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <ShieldIcon className={styles.menuIcon} /> Security & Access
          </button>
        </div>

        {/* Right Content */}
        <Card className={styles.contentArea}>
          {activeTab === 'general' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>General Platform Settings</h2>
              <p className={styles.sectionDesc}>Basic configuration for the Equine Elite platform.</p>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Platform Name</label>
                <input 
                  type="text" 
                  name="platformName"
                  className={styles.input} 
                  value={settings.platformName}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.divider}></div>

              <div className={styles.toggleGroup}>
                <div>
                  <h3 className={styles.toggleTitle}>Maintenance Mode</h3>
                  <p className={styles.toggleDesc}>Disable access for all non-admin users. Use during scheduled upgrades.</p>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'race' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Race & Tournament Configurations</h2>
              <p className={styles.sectionDesc}>Set default rules for races created on the platform.</p>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Max Horses per Race</label>
                <input 
                  type="number" 
                  name="maxHorsesPerRace"
                  className={styles.input} 
                  value={settings.maxHorsesPerRace}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Default Payout Distribution</label>
                <select 
                  name="defaultPayoutRule"
                  className={styles.select}
                  value={settings.defaultPayoutRule}
                  onChange={handleChange}
                >
                  <option value="winner_takes_all">Winner Takes All</option>
                  <option value="top_3">Top 3 Split (50/30/20)</option>
                  <option value="top_5">Top 5 Split (40/25/15/10/10)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Security & Access Policies</h2>
              <p className={styles.sectionDesc}>Manage how users authenticate and access the system.</p>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Session Timeout (Minutes)</label>
                <input 
                  type="number" 
                  name="sessionTimeout"
                  className={styles.input} 
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                />
                <p className={styles.helpText}>Automatically log out users after this period of inactivity.</p>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.toggleGroup}>
                <div>
                  <h3 className={styles.toggleTitle}>Require MFA for Staff</h3>
                  <p className={styles.toggleDesc}>Force Multi-Factor Authentication for Referees and Admins.</p>
                </div>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    name="mfaEnabled"
                    checked={settings.mfaEnabled}
                    onChange={handleChange}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
