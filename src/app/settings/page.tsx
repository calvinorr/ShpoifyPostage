export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure your preferences and application settings.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">General Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Currency</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>GBP (£)</option>
                  <option>EUR (€)</option>
                  <option>USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Package Type</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Letter</option>
                  <option>Large Letter</option>
                  <option>Small Packet</option>
                  <option>Package</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label className="ml-2 text-sm text-gray-700">Email notifications for price changes</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label className="ml-2 text-sm text-gray-700">Browser notifications</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label className="ml-2 text-sm text-gray-700">Weekly summary emails</label>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Theme</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Appearance</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label className="ml-2 text-sm text-gray-700">Save calculation history</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label className="ml-2 text-sm text-gray-700">Analytics and usage tracking</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Reset to Defaults
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}