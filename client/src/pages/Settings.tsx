import { useState } from 'react';
import Page from '@/components/layout/Page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Database,
  Shield,
  Palette,
  Save,
  Key
} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    // Profile
    fullName: 'Gareth Bowers',
    email: 'gareth.bowers@smartflowsystems.com',
    phone: '(555) 123-4567',

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    leadAlerts: true,

    // Preferences
    theme: 'dark',
    language: 'en',
    timezone: 'America/New_York',

    // Security
    twoFactorAuth: false,
    sessionTimeout: 60,
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // TODO: API call to save settings
  };

  return (
    <Page title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Settings */}
        <Card className="panel-dark border-gold-800/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gold" />
              <CardTitle className="text-gold-shine">Profile Settings</CardTitle>
            </div>
            <CardDescription className="text-gold-300/70">
              Manage your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gold-300">Full Name</Label>
                <Input
                  id="fullName"
                  value={settings.fullName}
                  onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                  className="input-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gold-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="input-gold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gold-300">Phone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="input-gold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="panel-dark border-gold-800/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gold" />
              <CardTitle className="text-gold-shine">Notifications</CardTitle>
            </div>
            <CardDescription className="text-gold-300/70">
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gold-300">Email Notifications</Label>
                <p className="text-sm text-gold-300/60">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gold-300">Push Notifications</Label>
                <p className="text-sm text-gold-300/60">Browser push notifications</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gold-300">Task Reminders</Label>
                <p className="text-sm text-gold-300/60">Get reminded about due tasks</p>
              </div>
              <Switch
                checked={settings.taskReminders}
                onCheckedChange={(checked) => setSettings({ ...settings, taskReminders: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gold-300">Lead Alerts</Label>
                <p className="text-sm text-gold-300/60">Notify when new leads arrive</p>
              </div>
              <Switch
                checked={settings.leadAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, leadAlerts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="panel-dark border-gold-800/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-gold" />
              <CardTitle className="text-gold-shine">Appearance</CardTitle>
            </div>
            <CardDescription className="text-gold-300/70">
              Customize your CRM experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-gold-300">Theme</Label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="w-full bg-brown-900/50 border border-gold-800/30 rounded-md px-3 py-2 text-gold-300"
              >
                <option value="dark">Dark (Default)</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-gold-300">Language</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full bg-brown-900/50 border border-gold-800/30 rounded-md px-3 py-2 text-gold-300"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-gold-300">Timezone</Label>
                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full bg-brown-900/50 border border-gold-800/30 rounded-md px-3 py-2 text-gold-300"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="panel-dark border-gold-800/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gold" />
              <CardTitle className="text-gold-shine">Security</CardTitle>
            </div>
            <CardDescription className="text-gold-300/70">
              Manage security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gold-300">Two-Factor Authentication</Label>
                <p className="text-sm text-gold-300/60">Add extra security to your account</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="text-gold-300">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="input-gold"
              />
            </div>
            <div>
              <Button className="btn-gold-ghost w-full justify-center">
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card className="panel-dark border-gold-800/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gold" />
              <CardTitle className="text-gold-shine">Data Management</CardTitle>
            </div>
            <CardDescription className="text-gold-300/70">
              Export, backup, and manage your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="btn-gold-ghost w-full justify-center">
              Export All Data (CSV)
            </Button>
            <Button className="btn-gold-ghost w-full justify-center">
              Backup Database
            </Button>
            <Button variant="destructive" className="w-full">
              Delete All Data (Danger)
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" className="border-gold-800/30 text-gold-300">
            Cancel
          </Button>
          <Button className="btn-gold" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </Page>
  );
}
