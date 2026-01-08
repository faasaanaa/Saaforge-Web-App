export function getCategoryIcon(category?: string): string {
  if (!category) return '📦';
  
  const categoryMap: Record<string, string> = {
    'Web Development': '</>',
    'Software Automation': '⚙️',
    'Cloud Computing': '☁️',
    'Mobile Development': '📱',
    'Machine Learning': '🤖',
    'Data Science': '📊',
    'DevOps': '🔧',
    'Blockchain': '⛓️',
    'API Development': '🔌',
    'Game Development': '🎮',
    'E-commerce': '🛒',
    'SaaS': '☁️',
    'IoT': '📡',
    'Cybersecurity': '🔐',
    'UI/UX Design': '🎨',
  };
  
  return categoryMap[category] || '📦';
}

export function getCategoryColor(category?: string): string {
  if (!category) return 'bg-gray-800 text-gray-300';
  
  const categoryColorMap: Record<string, string> = {
    'Web Development': 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
    'Software Automation': 'bg-orange-900/50 text-orange-300 border border-orange-700/50',
    'Cloud Computing': 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50',
    'Mobile Development': 'bg-green-900/50 text-green-300 border border-green-700/50',
    'Machine Learning': 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
    'Data Science': 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50',
    'DevOps': 'bg-red-900/50 text-red-300 border border-red-700/50',
    'Blockchain': 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
    'API Development': 'bg-pink-900/50 text-pink-300 border border-pink-700/50',
    'Game Development': 'bg-violet-900/50 text-violet-300 border border-violet-700/50',
    'E-commerce': 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50',
    'SaaS': 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50',
    'IoT': 'bg-slate-900/50 text-slate-300 border border-slate-700/50',
    'Cybersecurity': 'bg-rose-900/50 text-rose-300 border border-rose-700/50',
    'UI/UX Design': 'bg-fuchsia-900/50 text-fuchsia-300 border border-fuchsia-700/50',
  };
  
  return categoryColorMap[category] || 'bg-gray-800 text-gray-300';
}
