import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  PROJECT_OPTIONS,
  PROJECT_STORAGE_KEY,
  getProjectOption,
  getStoredProjectCode,
  isProjectCode,
  type ProjectCode,
} from '../config/projectApi'

export const useProjectStore = defineStore('project', () => {
  const activeProject = ref<ProjectCode>(getStoredProjectCode())

  const isSpace = computed(() => activeProject.value === 'space')
  const isSpaceUa = computed(() => activeProject.value === 'space_ua')
  const isIndigo = computed(() => activeProject.value === 'indigo')
  const usesDefaultRecruitment = computed(() => activeProject.value !== 'indigo')
  const activeProjectMeta = computed(() => getProjectOption(activeProject.value))

  const projectName = computed(() => activeProjectMeta.value.label)

  function setProject(project: ProjectCode) {
    if (!isProjectCode(project)) return

    activeProject.value = project
    localStorage.setItem(PROJECT_STORAGE_KEY, project)
  }

  return {
    activeProject,
    activeProjectMeta,
    projectOptions: PROJECT_OPTIONS,
    isSpace,
    isSpaceUa,
    isIndigo,
    usesDefaultRecruitment,
    projectName,
    setProject
  }
})
