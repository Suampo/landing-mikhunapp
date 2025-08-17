// src/components/DashboardCard.jsx
export default function DashboardCard({ title, value, action }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-xl font-bold">{value}</p>
      </div>
      {action && (
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          {action}
        </button>
      )}
    </div>
  );
}