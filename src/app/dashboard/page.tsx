export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Analytics and insights for your shipping calculations and price monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
            <p className="mt-2 text-gray-600">Track your calculation history and most used destinations.</p>
            <div className="mt-4 text-sm text-blue-600">Coming Soon</div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Cost Savings</h3>
            <p className="mt-2 text-gray-600">Monitor potential savings from price alerts and optimization.</p>
            <div className="mt-4 text-sm text-blue-600">Coming Soon</div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>
            <p className="mt-2 text-gray-600">Set up notifications for price changes on your favorite destinations.</p>
            <div className="mt-4 text-sm text-blue-600">Coming Soon</div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Popular Destinations</h3>
            <p className="mt-2 text-gray-600">See which destinations are calculated most frequently.</p>
            <div className="mt-4 text-sm text-blue-600">Coming Soon</div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="mt-2 text-gray-600">Your recent calculations and saved quotes.</p>
            <div className="mt-4 text-sm text-blue-600">Coming Soon</div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="mt-2 text-gray-600">Frequently used calculations and shortcuts.</p>
            <div className="mt-4 text-sm text-blue-600">Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}