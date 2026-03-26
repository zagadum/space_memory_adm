import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ProjectCode = 'space' | 'indigo'

export const useProjectStore = defineStore('project', () => {
  const activeProject = ref<ProjectCode>((localStorage.getItem('gls_active_project') as ProjectCode) || 'space')

  const isSpace = computed(() => activeProject.value === 'space')
  const isIndigo = computed(() => activeProject.value === 'indigo')

  const projectName = computed(() => activeProject.value === 'indigo' ? 'Indigo' : 'Space Memory')

  function setProject(project: ProjectCode) {
    activeProject.value = project
    localStorage.setItem('gls_active_project', project)
  }

  return {
    activeProject,
    isSpace,
    isIndigo,
    projectName,
    setProject
  }
})
