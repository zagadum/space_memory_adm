import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  PROJECT_OPTIONS,
  PROJECT_STORAGE_KEY,
  getProjectOption,
  getStoredProjectCode,
  normalizeProjectCode,
  type ProjectCode,
} from '../config/projectApi'

export const useProjectStore = defineStore('project', () => {
  const activeProject = ref<ProjectCode>(getStoredProjectCode())

  const isSpace = computed(() => activeProject.value === 'space')
  const isIndigo = computed(() => activeProject.value === 'indigo')
  const usesDefaultRecruitment = computed(() => activeProject.value === 'space')
  const activeProjectMeta = computed(() => getProjectOption(activeProject.value))

  const projectName = computed(() => activeProjectMeta.value.label)

  function setProject(project: ProjectCode | string | null | undefined) {
    const normalizedProject = normalizeProjectCode(project)
    if (!normalizedProject) return

    activeProject.value = normalizedProject
    localStorage.setItem(PROJECT_STORAGE_KEY, normalizedProject)
  }

  return {
    activeProject,
    activeProjectMeta,
    projectOptions: PROJECT_OPTIONS,
    isSpace,
    isIndigo,
    usesDefaultRecruitment,
    projectName,
    setProject
  }
})
