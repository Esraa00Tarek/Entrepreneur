import React, { useRef, useEffect, useState } from 'react';
import { Calendar, FileText, Image, Download, Plus, TrendingUp, Clock, Target, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMilestones } from '../redux/slices/milestonesSlice';
import { Progress } from '@/components/ui/progress';

export default function MilestonesSection({ userRole = "entrepreneur" }) {
  const dispatch = useDispatch();
  const milestones = useSelector(state => state.milestones.items);
  const milestonesLoading = useSelector(state => state.milestones.loading);
  const milestonesError = useSelector(state => state.milestones.error);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newLog, setNewLog] = useState({ title: '', description: '', files: [], stage: '' });
  const [addErrors, setAddErrors] = useState({});
  const [error, setError] = useState(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', stage: '' });
  const [selectedStage, setSelectedStage] = useState(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const milestonesList = milestones || [];

  const [activeLogIdx, setActiveLogIdx] = useState(0);
  const logRefs = useRef([]);

  const BASE_URL = 'http://localhost:5000';

  // تعريف المراحل والنسب المئوية لكل مرحلة - فقط المراحل الموجودة
  const STAGE_PROGRESS = {
    'Idea': 0,
    'MVP': 33,
    'Launched': 66
  };

  // عدد الميلستونز المطلوبة لكل مرحلة
  const MILESTONES_PER_STAGE = 4;

  // المراحل المتاحة فقط
  const businessStages = ["Idea", "MVP", "Launched"];

  // حساب البروجرس بناءً على المرحلة والميلستونز
  const calculateProgress = (stage, milestonesCount) => {
    const baseProgress = STAGE_PROGRESS[stage] || 0;
    const milestonesProgress = Math.min((milestonesCount / MILESTONES_PER_STAGE) * 33, 33);
    return Math.min(baseProgress + milestonesProgress, 100);
  };

  // التحقق من إمكانية إضافة ميلستون للمرحلة المحددة
  const canAddMilestoneToStage = (stage) => {
    const stageMilestones = milestonesList.filter(m => m.stageUpdate === stage);
    return stageMilestones.length < MILESTONES_PER_STAGE;
  };

  // الحصول على عدد الميلستونز المتبقية للمرحلة
  const getRemainingMilestonesForStage = (stage) => {
    const stageMilestones = milestonesList.filter(m => m.stageUpdate === stage);
    return MILESTONES_PER_STAGE - stageMilestones.length;
  };

  // الحصول على الميلستونز للمرحلة المحددة
  const getMilestonesForStage = (stage) => {
    return milestonesList.filter(m => m.stageUpdate === stage);
  };

  // تحديث البروجرس في الباك إند
  const updateProgressInBackend = async (businessId, progress) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/businesses/${businessId}`,
        { progress },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  // تحديث مرحلة المشروع في الباك إند
  const updateProjectStage = async (businessId, newStage) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/businesses/${businessId}`,
        { stage: newStage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // تحديث المشاريع المحلية
      setProjects(prev => prev.map(p => 
        p.id === businessId ? { ...p, stage: newStage } : p
      ));
    } catch (err) {
      console.error('Error updating project stage:', err);
    }
  };

  // حساب البروجرس الحالي للمشروع المحدد
  const getCurrentProgress = () => {
    if (!selectedProject || !milestonesList) return 0;
    
    const currentStage = selectedProject.stage;
    const stageMilestones = milestonesList.filter(m => m.stageUpdate === currentStage);
    const milestonesCount = stageMilestones.length;
    
    return calculateProgress(currentStage, milestonesCount);
  };

  const getFileUrl = (file) => {
    if (!file) return '';
    if (typeof file === 'string') return file;
    if (file.url) return file.url;
    if (file instanceof Blob) return URL.createObjectURL(file);
    return '';
  };

  // تحرير الميلستون
  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setEditForm({
      title: milestone.title,
      description: milestone.description,
      stage: milestone.stageUpdate
    });
  };

  // حفظ التعديلات
  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/milestones/${editingMilestone._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setEditingMilestone(null);
      setEditForm({ title: '', description: '', stage: '' });
      dispatch(fetchMilestones(selectedProjectId));
      
      // تحديث البروجرس
      setTimeout(() => {
        const newProgress = getCurrentProgress();
        setProgressValue(newProgress);
        updateProgressInBackend(selectedProjectId, newProgress);
      }, 1000);
    } catch (err) {
      console.error('Error updating milestone:', err);
      alert('Error updating milestone: ' + (err.response?.data?.message || err.message));
    }
  };

  // حذف الميلستون
  const handleDeleteMilestone = async (milestoneId) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BASE_URL}/api/milestones/${milestoneId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      dispatch(fetchMilestones(selectedProjectId));
      
      // تحديث البروجرس
      setTimeout(() => {
        const newProgress = getCurrentProgress();
        setProgressValue(newProgress);
        updateProgressInBackend(selectedProjectId, newProgress);
      }, 1000);
    } catch (err) {
      console.error('Error deleting milestone:', err);
      alert('Error deleting milestone: ' + (err.response?.data?.message || err.message));
    }
  };

  // التنقل بين المراحل
  const handleStageClick = (stage) => {
    setSelectedStage(stage);
  };

  // إعادة تعيين المرحلة المحددة عند تغيير المشروع
  useEffect(() => {
    if (selectedProject) {
      setSelectedStage(selectedProject.stage);
    }
  }, [selectedProject]);

  useEffect(() => {
    // جلب البزنسات من الباك اند
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem('token');
                 const res = await axios.get('http://localhost:5000/api/businesses/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // اعتبري كل بزنس هو project
        const businesses = res.data.businesses ?? res.data.data ?? [];
        // فلترة البزنسات الحقيقية فقط (اللي عندها _id)
        const projectsFromBusinesses = businesses
          .filter(biz => biz && biz._id)
          .map(biz => ({
            id: biz._id,
            name: biz.name,
            stage: biz.stage || 'Idea',
            startDate: biz.creationDate || biz.createdAt || '',
            progress: biz.progress ?? 0,
            logs: []
          }));
        setProjects(projectsFromBusinesses);
        if (projectsFromBusinesses.length > 0) {
          setSelectedProjectId(projectsFromBusinesses[0].id);
          setCurrentProjectIndex(0);
        } else {
          setSelectedProjectId(null);
        }
      } catch (err) {
        setProjects([]);
        setSelectedProjectId(null);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchMilestones(selectedProjectId));
    }
  }, [dispatch, selectedProjectId]);

  // تحديث البروجرس عند تغيير المشروع أو الميلستونز
  useEffect(() => {
    if (selectedProject && milestonesList) {
      const currentProgress = getCurrentProgress();
      setProgressValue(currentProgress);
      
      // تحديث البروجرس في الباك إند
      updateProgressInBackend(selectedProject.id, currentProgress);
    }
  }, [selectedProject, milestonesList]);

  // تحريك البروجرس بار
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressValue);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressValue]);

  const handleAddLog = async () => {
    const errors = {};
    if (!newLog.title.trim()) errors.title = 'Title is required';
    if (!newLog.stage) errors.stage = 'Stage is required';
    if (!newLog.description || newLog.description.trim().length < 20) errors.description = 'Description is required and must be at least 20 characters';
    
    // التحقق من عدد الميلستونز في المرحلة
    if (!canAddMilestoneToStage(newLog.stage)) {
      errors.stage = `Cannot add more than ${MILESTONES_PER_STAGE} milestones to ${newLog.stage} stage`;
    }
    
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const formData = new FormData();
      formData.append('title', newLog.title);
      formData.append('description', newLog.description);
      formData.append('stageUpdate', newLog.stage);
      if (newLog.files && newLog.files.length > 0) {
        newLog.files.forEach(file => formData.append('files', file));
      }
      const token = localStorage.getItem('token');
      const addRes = await axios.post(
        `${BASE_URL}/api/milestones?businessId=${selectedProjectId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Milestone add response:', addRes.data);

      setNewLog({ title: '', description: '', files: [], stage: '' });
      setAddErrors({});
      dispatch(fetchMilestones(selectedProjectId));
      
      // تحديث البروجرس بعد إضافة الميلستون
      setTimeout(() => {
        const newProgress = getCurrentProgress();
        setProgressValue(newProgress);
        updateProgressInBackend(selectedProjectId, newProgress);
      }, 1000);
    } catch (err) {
      console.log('Milestone add error:', err.response?.data || err.message);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFileDownload = (file) => {
    if (typeof file === 'string') {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([file], { type: 'application/octet-stream' }));
      link.download = file;
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const isImageFile = (file) => {
    if (!file) return false;
    const name = typeof file === 'string' ? file : file.name || file.originalName || '';
    return name && name.match(/\.(jpg|jpeg|png|gif)$/i);
  };

  const getStageColor = () => {
    return "bg-[#A8DADC] text-[#1D3557] border-[#A8DADC]";
  };

  // Navigation functions for project carousel
  const handlePrevProject = () => {
    if (projects.length === 0) return;
    const newIndex = currentProjectIndex > 0 ? currentProjectIndex - 1 : projects.length - 1;
    setCurrentProjectIndex(newIndex);
    setSelectedProjectId(projects[newIndex].id);
  };

  const handleNextProject = () => {
    if (projects.length === 0) return;
    const newIndex = currentProjectIndex < projects.length - 1 ? currentProjectIndex + 1 : 0;
    setCurrentProjectIndex(newIndex);
    setSelectedProjectId(projects[newIndex].id);
  };

  const handleProjectSelect = (projectId, index) => {
    setSelectedProjectId(projectId);
    setCurrentProjectIndex(index);
  };

  useEffect(() => {
    if (!selectedProject?.logs?.length) return;
    logRefs.current = logRefs.current.slice(0, selectedProject.logs.length);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .map(e => Number(e.target.getAttribute('data-idx')));
        if (visible.length > 0) {
          setActiveLogIdx(visible[0]);
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.5 }
    );
    logRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => {
      logRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [selectedProject?.logs]);

  // الحصول على الميلستونز للمرحلة المحددة
  const currentStageMilestones = selectedStage ? getMilestonesForStage(selectedStage) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-10">
        
        {/* Projects Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#457B9D] to-[#1D3557] rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#1D3557' }}>
                  Project Milestones
                </h1>
                <p className="text-gray-500 text-sm">Track your project progress and achievements</p>
              </div>
            </div>
            {projects.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={handlePrevProject}
                  className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gradient-to-r hover:from-[#457B9D] hover:to-[#1D3557] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextProject}
                  className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gradient-to-r hover:from-[#457B9D] hover:to-[#1D3557] hover:text-white hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Projects Horizontal List */}
          <div className="bg-gradient-to-r from-white via-gray-50 to-white border border-gray-200 rounded-3xl p-8 shadow-lg backdrop-blur-sm">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id, index)}
                  className={`flex-shrink-0 p-6 rounded-2xl border transition-all duration-300 min-w-[280px] group relative overflow-hidden ${
                    selectedProjectId === project.id
                      ? 'bg-gradient-to-br from-[#457B9D] to-[#1D3557] border-[#457B9D] text-white shadow-xl scale-105'
                      : 'bg-white border-gray-200 text-[#1D3557] hover:bg-gradient-to-br hover:from-[#A8DADC]/20 hover:to-[#457B9D]/10 hover:border-[#457B9D]/30 hover:shadow-lg hover:scale-102'
                  }`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
                  </div>
                  
                  <div className="relative text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedProjectId === project.id 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : 'bg-gradient-to-br from-[#457B9D] to-[#1D3557]'
                      }`}>
                        <Target className={`w-5 h-5 ${
                          selectedProjectId === project.id ? 'text-white' : 'text-white'
                        }`} />
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-3 group-hover:scale-105 transition-transform duration-300">
                      {project.name}
                    </h3>
                    
                    {project.startDate && (
                      <div className="flex items-center justify-center gap-2 mt-4 text-sm opacity-80">
                        <div className={`p-1 rounded-full ${
                          selectedProjectId === project.id ? 'bg-white/20' : 'bg-[#457B9D]/10'
                        }`}>
                          <Calendar className="w-3 h-3" />
                        </div>
                        <span className="font-medium">
                          {new Date(project.startDate).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
              
              {projects.length === 0 && (
                <div className="text-center py-16 w-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#457B9D] to-[#1D3557] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1D3557] mb-2">No projects yet</h3>
                  <p className="text-gray-500">Add a project first to view milestones and track your progress.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Progress Bar */}
        {selectedProjectId && selectedProject && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#457B9D] to-[#1D3557] rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#1D3557' }}>
                    Project Progress
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {selectedProject.name} - {selectedProject.stage} Stage
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ color: '#457B9D' }}>
                  {Math.round((milestonesList.length / 12) * 100)}%
                </div>
                <div className="text-sm text-gray-500">
                  {milestonesList.length} of 12 milestones completed
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Progress 
                  value={(milestonesList.length / 12) * 100} 
                  className="h-4 bg-gray-100 rounded-full overflow-hidden"
                  style={{
                    background: `linear-gradient(90deg, #457B9D ${(milestonesList.length / 12) * 100}%, #E0E7EF ${(milestonesList.length / 12) * 100}%)`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stage Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
          {businessStages.map((stage) => {
            const stageMilestones = milestonesList.filter(m => m.stageUpdate === stage);
            const isCurrentStage = selectedProject && selectedProject.stage === stage;
            const isCompleted = stageMilestones.length >= MILESTONES_PER_STAGE;
            const isPreviousStage = selectedProject && businessStages.indexOf(stage) < businessStages.indexOf(selectedProject.stage);
            const isSelected = selectedStage === stage;
            return (
              <button
                key={stage}
                onClick={() => handleStageClick(stage)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
                  isSelected
                    ? 'border-[#457B9D] bg-[#457B9D]/10 shadow-md' 
                    : isCompleted || isPreviousStage
                      ? 'border-green-200 bg-green-50 hover:border-green-300' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isSelected
                      ? 'bg-[#457B9D]' 
                      : isCompleted || isPreviousStage
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isSelected
                      ? 'text-[#457B9D]' 
                      : isCompleted || isPreviousStage
                        ? 'text-green-700' 
                        : 'text-gray-500'
                  }`}>
                    {stage}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {stageMilestones.length}/{MILESTONES_PER_STAGE} milestones
                </div>
              </button>
            );
          })}
        </div>

        {/* Create Milestone Form */}
        {selectedProjectId && selectedProject && userRole === 'entrepreneur' && selectedStage && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
            <h2 className="font-bold text-2xl mb-6 flex items-center gap-3" style={{ color: '#1D3557' }}>
              <div className="w-10 h-10 bg-[#457B9D] rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Create New Milestone - {selectedStage} Stage
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="Milestone title..."
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent bg-white transition-all text-gray-900 ${addErrors.title ? 'border-red-500' : 'border-gray-200'}`}
                  value={newLog.title}
                  onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                />
                {addErrors.title && <p className="text-red-500 text-sm mt-1">{addErrors.title}</p>}
              </div>
              <div>
              <select
                value={newLog.stage}
                onChange={(e) => setNewLog({ ...newLog, stage: e.target.value })}
                className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent bg-white transition-all text-gray-900 ${addErrors.stage ? 'border-red-500' : 'border-gray-200'}`}
              >
                <option value="">Select business stage</option>
                  {businessStages.map((stage, idx) => {
                    const stageMilestones = milestonesList.filter(m => m.stageUpdate === stage);
                    const canAdd = stageMilestones.length < MILESTONES_PER_STAGE;
                    
                    return (
                      <option 
                        key={idx} 
                        value={stage}
                        disabled={!canAdd}
                      >
                        {stage} ({stageMilestones.length}/{MILESTONES_PER_STAGE}) {!canAdd ? '- Full' : ''}
                      </option>
                    );
                  })}
              </select>
              {addErrors.stage && <p className="text-red-500 text-sm mt-1">{addErrors.stage}</p>}
              </div>
            </div>
            
            <div className="mb-6">
              <textarea
                placeholder="Describe your milestone in detail..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent bg-white transition-all text-gray-900 ${addErrors.description ? 'border-red-500' : 'border-gray-200'}`}
                value={newLog.description}
                onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
              />
              {addErrors.description && <p className="text-red-500 text-sm mt-1">{addErrors.description}</p>}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach files (optional)
                </label>
                <input
                  type="file"
                  multiple
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent bg-white transition-all text-gray-900 ${addErrors.files ? 'border-red-500' : 'border-gray-200'}`}
                  onChange={(e) => setNewLog({ ...newLog, files: Array.from(e.target.files || []) })}
                />
                {addErrors.files && <p className="text-red-500 text-sm mt-1">{addErrors.files}</p>}
              </div>
              <button
                onClick={handleAddLog}
                disabled={!canAddMilestoneToStage(selectedStage)}
                className={`px-8 py-3 rounded-xl shadow-md transition-all duration-300 font-medium flex items-center gap-2 ${
                  canAddMilestoneToStage(selectedStage)
                    ? 'bg-[#457B9D] text-white hover:bg-[#1D3557]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5" />
                Add Milestone ({getRemainingMilestonesForStage(selectedStage)} remaining)
              </button>
            </div>
          </div>
        )}

        {/* Milestones Timeline - Vertical Layout */}
        {selectedProjectId && selectedProject && selectedStage && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1D3557' }}>
                {selectedStage} Stage Milestones ({currentStageMilestones.length}/{MILESTONES_PER_STAGE})
              </h2>
              {currentStageMilestones.length === 0 && (
                <p className="text-gray-500">No milestones for this stage yet.</p>
              )}
            </div>
            
            {milestonesLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-[#457B9D]/30 border-t-[#457B9D] rounded-full animate-spin mb-6"></div>
                <div className="text-lg text-[#457B9D] font-semibold mb-2">Loading milestones...</div>
                <div className="text-sm text-gray-500">Please wait while we fetch your project milestones.</div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <div className="text-red-600 font-medium">{error}</div>
              </div>
            ) : currentStageMilestones.length > 0 ? (
              currentStageMilestones.map((log, idx) => (
                <div
                  key={idx}
                  data-idx={idx}
                  ref={el => logRefs.current[idx] = el}
                  className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#457B9D] rounded-full">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{log.date}</span>
                      <span className="px-3 py-1 bg-[#A8DADC] text-[#1D3557] rounded-full text-xs font-medium">
                        {log.stageUpdate}
                      </span>
                    </div>
                    
                    {userRole === 'entrepreneur' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMilestone(log)}
                          className="p-2 text-[#457B9D] hover:bg-[#457B9D]/10 rounded-lg transition-colors"
                          title="Edit milestone"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(log._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete milestone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingMilestone && editingMilestone._id === log._id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                      />
                      <select
                        value={editForm.stage}
                        disabled
                        className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                      >
                        {businessStages.map((stage, idx) => (
                          <option key={idx} value={stage}>{stage}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMilestone(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                  <h3 className="font-bold text-2xl mb-4" style={{ color: '#1D3557' }}>{log.title}</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">{log.description}</p>
                  
                  {log.files?.length > 0 && (
                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="text-sm font-semibold mb-4 flex items-center gap-3" style={{ color: '#1D3557' }}>
                        <div className="p-1 bg-[#457B9D] rounded-full">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        Attachments ({log.files.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {log.files.map((file, fidx) => {
                          const name = typeof file === 'string' ? file : file.name || file.originalName || '';
                          return (
                            <div key={fidx} className="group relative bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                              {isImageFile(file) ? (
                                <div className="relative">
                                  <div className="p-1 bg-[#457B9D] rounded-full mb-3">
                                    <Image className="w-5 h-5 text-white" />
                                  </div>
                                  <img
                                    src={getFileUrl(file)}
                                    alt={name}
                                    className="w-full h-24 object-cover rounded-lg mb-3"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="p-1 bg-[#457B9D] rounded-full">
                                    <FileText className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="text-sm text-gray-600 truncate font-medium">{name}</span>
                                </div>
                              )}
                              
                              {(userRole === 'entrepreneur' || userRole === 'investor') && (
                                <button
                                  className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-white bg-[#457B9D] hover:bg-[#1D3557] font-medium py-2 px-4 rounded-lg transition-all duration-300"
                                  onClick={() => handleFileDownload(file)}
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-[#457B9D] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#1D3557' }}>No milestones for {selectedStage} stage</h3>
                <p className="text-gray-600">Start tracking your project progress by adding your first milestone for this stage above.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}