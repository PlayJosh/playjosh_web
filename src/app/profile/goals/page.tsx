'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiTrash2, FiEdit2, FiClock, FiTarget } from 'react-icons/fi'
import { supabase } from '@/lib/supabase/client'

export type Goal = {
  id?: string;
  profile_email: string;
  goal: string;
  goal_type: 'short_term' | 'long_term';
  created_at: string;
  updated_at?: string;
  user_id?: string;
};

// Type guard to ensure the object matches the Goal type
const isGoal = (item: unknown): item is Goal => {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  
  const goalItem = item as Record<string, unknown>;
  
  return (
    typeof goalItem.goal === 'string' &&
    (goalItem.goal_type === 'short_term' || goalItem.goal_type === 'long_term') &&
    typeof goalItem.profile_email === 'string' &&
    typeof goalItem.created_at === 'string'
  );
};

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [newGoal, setNewGoal] = useState('')
  const [goalType, setGoalType] = useState<'short_term' | 'long_term'>('short_term')
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const fetchUserAndGoals = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user?.email) {
          throw userError || new Error('No user logged in')
        }
        
        setUserEmail(user.email)
        
        // Fetch goals for the user
        const { data, error } = await supabase
          .from('profile_goals')
          .select('*')
          .eq('profile_email', user.email)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        // Validate and type the response
        const typedGoals = (data || []).map(item => {
          if (!isGoal(item)) {
            console.warn('Invalid goal format from database:', item);
            return null;
          }
          return {
            ...item,
            goal_type: item.goal_type === 'long_term' ? 'long_term' as const : 'short_term' as const
          };
        }).filter((goal): goal is Goal => goal !== null);
        
        setGoals(typedGoals)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndGoals()
  }, [])

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newGoal.trim() || !userEmail) return
    
    try {
      const { data, error } = await supabase
        .from('profile_goals')
        .insert([
          { 
            profile_email: userEmail, 
            goal: newGoal.trim(), 
            goal_type: goalType 
          }
        ])
        .select()
      
      if (error) throw error
      
      if (data && data[0] && isGoal(data[0])) {
        const newGoalItem = {
          ...data[0],
          goal_type: data[0].goal_type === 'long_term' ? 'long_term' as const : 'short_term' as const
        };
        setGoals([newGoalItem, ...goals]);
        setNewGoal('');
      }
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const handleDeleteGoal = async (goalToDelete: Goal) => {
    if (!goalToDelete.profile_email || !goalToDelete.goal) {
      console.error('Cannot delete goal: Missing required fields', goalToDelete);
      return;
    }
    
    try {
      console.log('Deleting goal:', {
        profile_email: goalToDelete.profile_email,
        goal: goalToDelete.goal,
        goal_type: goalToDelete.goal_type
      });
      
      const { error } = await supabase
        .from('profile_goals')
        .delete()
        .match({
          profile_email: goalToDelete.profile_email,
          goal: goalToDelete.goal,
          goal_type: goalToDelete.goal_type
        });
      
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log('Successfully deleted goal');
      setGoals(prevGoals => {
        const updatedGoals = prevGoals.filter(goal => 
          !(goal.profile_email === goalToDelete.profile_email && 
            goal.goal === goalToDelete.goal &&
            goal.goal_type === goalToDelete.goal_type)
        );
        console.log('Updated goals after deletion:', updatedGoals);
        return updatedGoals;
      });
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal. Please try again.');
    }
  }

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingGoal || !newGoal.trim() || !userEmail) return
    
    try {
      // First delete the old goal
      const { error: deleteError } = await supabase
        .from('profile_goals')
        .delete()
        .match({
          profile_email: userEmail,
          goal: editingGoal.goal,
          goal_type: editingGoal.goal_type
        });
      
      if (deleteError) throw deleteError;
      
      // Then insert the updated goal
      const { data, error } = await supabase
        .from('profile_goals')
        .insert([
          { 
            profile_email: userEmail, 
            goal: newGoal.trim(), 
            goal_type: goalType,
            created_at: editingGoal.created_at
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the local state
      if (data && isGoal(data)) {
        const updatedGoal = {
          ...data,
          goal_type: data.goal_type === 'long_term' ? 'long_term' as const : 'short_term' as const
        };
        
        setGoals(prevGoals => 
          prevGoals.map(goal => 
            goal.profile_email === userEmail && 
            goal.goal === editingGoal.goal && 
            goal.goal_type === editingGoal.goal_type 
              ? updatedGoal 
              : goal
          )
        );
        
        setEditingGoal(null);
        setNewGoal('');
        setGoalType('short_term');
      }
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal)
    setNewGoal(goal.goal)
    setGoalType(goal.goal_type)
  }

  const cancelEditing = () => {
    setEditingGoal(null)
    setNewGoal('')
    setGoalType('short_term')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white rounded-lg shadow p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            <span className="font-medium">Back to Profile</span>
          </button>
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-900">My Goals</h1>
            <p className="text-gray-600 mt-1">Set and track your fitness and sports goals</p>
          </div>
        </div>

        {/* Add/Edit Goal Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h2>
          <form onSubmit={editingGoal ? handleEditGoal : handleAddGoal} className="space-y-5">
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s your goal?
              </label>
              <input
                type="text"
                id="goal"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="w-full text-gray-700 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="E.g., Run a 5K in under 25 minutes"
                required
              />
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-3">Goal Type</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  goalType === 'short_term' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    checked={goalType === 'short_term'}
                    onChange={() => setGoalType('short_term')}
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <FiClock className={`mr-2 ${goalType === 'short_term' ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${goalType === 'short_term' ? 'text-blue-700' : 'text-gray-700'}`}>
                        Short Term
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Achievable within 3 months</p>
                  </div>
                </label>
                
                <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  goalType === 'long_term' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                    checked={goalType === 'long_term'}
                    onChange={() => setGoalType('long_term')}
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <FiTarget className={`mr-2 ${goalType === 'long_term' ? 'text-purple-600' : 'text-gray-500'}`} />
                      <span className={`font-medium ${goalType === 'long_term' ? 'text-purple-700' : 'text-gray-700'}`}>
                        Long Term
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">3 months to 1+ year goals</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              {editingGoal && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
            </div>
          </form>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Goals</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
            </span>
          </div>
          
          {goals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FiTarget className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No goals yet</h3>
              <p className="mt-1 text-gray-500">Add your first goal to get started on your journey!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div 
                  key={`${goal.goal}-${goal.goal_type}`} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2.5 rounded-lg ${goal.goal_type === 'short_term' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {goal.goal_type === 'short_term' ? (
                          <FiClock className="h-5 w-5" />
                        ) : (
                          <FiTarget className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium text-base">{goal.goal}</h3>
                        <div className="flex items-center mt-1.5 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            goal.goal_type === 'short_term' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {goal.goal_type === 'short_term' ? 'Short Term' : 'Long Term'}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span>Added {new Date(goal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditing(goal)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit goal"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoal(goal);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete goal"
                        disabled={loading}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
