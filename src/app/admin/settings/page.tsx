export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Application configuration and preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <SettingRow title="Company Name" description="ProHomeX" action="Edit" />
        <SettingRow title="Business Email" description="info@prohomex.com" action="Edit" />
        <SettingRow title="Support Phone" description="+91 XXXXX XXXXX" action="Edit" />
        <SettingRow title="GST Number" description="Not configured" action="Add" />
        <SettingRow title="Email Notifications" description="New leads and tickets" action="Configure" />
        <SettingRow title="SMS Alerts" description="Not configured" action="Configure" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="px-6 py-4 bg-slate-50">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">User Management</h3>
        </div>
        <SettingRow title="Staff Accounts" description="Manage admin and technician access" action="Manage" />
        <SettingRow title="Role Permissions" description="Control what each role can access" action="View" />
      </div>
    </div>
  );
}

function SettingRow({ title, description, action }: { title: string; description: string; action: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
        {action}
      </button>
    </div>
  );
}
