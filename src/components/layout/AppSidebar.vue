<template>
  <div class="sidebar" :class="{ open: appStore.isSidebarOpen }">
    <div class="sidebar-logo">
      <div class="logo-badge">
        <div class="logo-icon">
          <img src="/favicon/apple-touch-icon.png" alt="GLS Logo" class="brand-logo" />
        </div>
        <div>
          <div class="logo-text">GLS Admin</div>
          <div class="logo-sub">{{ projectStore.projectName }}</div>
        </div>
      </div>
      <div class="project-selector-container">
        <div
          class="school-pill"
          :class="{ 'dropdown-open': isProjectDropdownOpen, 'no-switch': visibleProjectOptions.length <= 1 }"
          @click="visibleProjectOptions.length > 1 && toggleProjectDropdown()"
        >
          <div class="school-dot" :class="projectStore.activeProjectMeta.dotClass"></div>
          <div class="project-info">
            <div class="school-name">{{ projectStore.projectName }}</div>
            <div class="school-city">GLS Network</div>
          </div>
          <span v-if="visibleProjectOptions.length > 1" class="selector-arrow">▼</span>
        </div>
        
        <div v-if="isProjectDropdownOpen && visibleProjectOptions.length > 1" class="project-dropdown">
          <div
            v-for="project in visibleProjectOptions"
            :key="project.code"
            class="dropdown-item"
            :class="{ active: projectStore.activeProject === project.code }"
            @click="selectProject(project.code)"
          >
            <div class="school-dot" :class="project.dotClass"></div>
            <span>{{ project.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <!-- МОЙ КАБИНЕТ -->
      <div 
        v-if="isVisible('my-cabinet')"
        class="nav-standalone nav-item--stub"
        :class="[{ active: activeItem === 'my-cabinet' }, accessClass('my-cabinet')]"
        @click="navigateTo('my-cabinet', '/my-cabinet')"
      >
        <span class="nav-icon">🏠</span> {{ t('sidebar.myCabinet') }}
        <span class="nav-badge blue" v-if="unreadNews > 0">{{ unreadNews }}</span>
      </div>

      <!-- ДАШБОРД -->
      <div
        v-if="isVisible('dashboard')"
        class="nav-standalone nav-item--stub"
        :class="[{ active: activeItem === 'dashboard' }, accessClass('dashboard')]"
        @click="setActive('dashboard')"
      >
        <span class="nav-icon">📊</span> {{ t('sidebar.dashboard') }}
      </div>

      <div 
        v-if="isSectionAllowed('secretariat')"
        class="nav-section"
        :class="{ open: openSections.secretariat }" 
        @click="toggleSection('secretariat')"
      >
        <span class="nav-section-icon">🗂️</span>
        <span class="nav-section-label">{{ t('sidebar.secretariat') }}</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div v-if="isSectionAllowed('secretariat')" class="nav-children" :class="{ open: openSections.secretariat }">

        <div 
          v-if="isVisible('students')"
          class="nav-item"
          :class="[{ active: activeItem === 'students' }, accessClass('students')]"
          @click="setActive('students')"
        >
          <span class="nav-icon">👩‍🚀</span> {{ t('sidebar.students') }}
          <span class="nav-badge green" v-if="listStore.totalStudents > 0">{{ listStore.totalStudents }}</span>
        </div>
        <div
          v-if="isVisible('groups')"
          class="nav-item"
          :class="[{ active: activeItem === 'groups' }, accessClass('groups')]"
          @click="navigateTo('groups', '/groups')"
        >
          <span class="nav-icon">🎓</span> {{ t('sidebar.groups') }}
          <span class="nav-badge blue" v-if="groupsListStore.totalGroups > 0">{{ groupsListStore.totalGroups }}</span>
        </div>
        <div
          v-if="isVisible('teachers')"
          class="nav-item"
          :class="[{ active: activeItem === 'teachers' }, accessClass('teachers')]"
          @click="navigateTo('teachers', '/teachers')"
        >
          <span class="nav-icon">👨‍🏫</span> {{ t('sidebar.teachers') }}
          <span class="nav-badge blue" v-if="teachersListStore.totalTeachers > 0">{{ teachersListStore.totalTeachers }}</span>
        </div>
        <div
          v-if="isVisible('inpost')"
          class="nav-item nav-item--stub"
          :class="{ active: activeItem === 'inpost' }"
          @click="setActive('inpost')"
        >
          <span class="nav-icon">📦</span> {{ t('sidebar.inpost') }}
        </div>
        <div
          v-if="isVisible('course-endings')"
          class="nav-item nav-item--stub"
          :class="[{ active: activeItem === 'course-endings' }, accessClass('course-endings')]"
          @click="navigateTo('course-endings', '/secretariat/course-endings')"
        >
          <span class="nav-icon">🏅</span> {{ t('sidebar.courseEndings') }}
        </div>
      </div>

      <!-- HR -->
      <div
        v-if="isSectionAllowed('hr')"
        class="nav-section"
        :class="{ open: openSections.hr }"
        @click="toggleSection('hr')"
      >
        <span class="nav-section-icon">👥</span>
        <span class="nav-section-label">{{ t('sidebar.hr') }}</span>
        <span class="nav-section-badge nb-green">8</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div v-if="isSectionAllowed('hr')" class="nav-children" :class="{ open: openSections.hr }">
        <div v-if="isVisible('hr-active')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'hr-active' }" @click="navigateTo('hr-active', '/hr/active')">
          <span class="nav-icon">👨‍🏫</span> {{ t('sidebar.hrActive') }}
        </div>
        <div v-if="isVisible('hr-training')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'hr-training' }" @click="navigateTo('hr-training', '/hr/training')">
          <span class="nav-icon">📚</span> {{ t('sidebar.hrTraining') }}
        </div>
        <div v-if="isVisible('hr-pipeline')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'hr-pipeline' }" @click="navigateTo('hr-pipeline', '/hr/pipeline')">
          <span class="nav-icon">🚀</span> {{ t('sidebar.hrPipeline') }}
        </div>
        <div v-if="isVisible('hr-personal')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'hr-personal' }" @click="navigateTo('hr-personal', '/hr/personal')">
          <span class="nav-icon">📋</span> {{ t('sidebar.hrPersonal') }}
        </div>
        <div v-if="isVisible('hr-analytics')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'hr-analytics' }" @click="navigateTo('hr-analytics', '/hr/analytics')">
          <span class="nav-icon">📊</span> {{ t('sidebar.hrAnalytics') }}
        </div>
      </div>

      <!-- PANEL TRENERA -->
      <div
        v-if="isSectionAllowed('trainer')"
        class="nav-section"
        :class="{ open: openSections.trainer }"
        @click="toggleSection('trainer')"
      >
        <span class="nav-section-icon">🧑‍🏫</span>
        <span class="nav-section-label">{{ t('sidebar.trainerCabinet') }}</span>
        <span class="nav-section-badge nb-red">4</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div v-if="isSectionAllowed('trainer')" class="nav-children" :class="{ open: openSections.trainer }">
        <div v-if="isVisible('trainer-dashboard')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'trainer-dashboard' }" @click="navigateTo('trainer-dashboard', '/trainer/dashboard')">
          <span class="nav-icon">📊</span> {{ t('sidebar.trainerDashboard') }}
        </div>
        <div v-if="isVisible('trainer-students')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'trainer-students' }" @click="navigateTo('trainer-students', '/trainer/students')">
          <span class="nav-icon">👩‍🎓</span> {{ t('sidebar.trainerStudents') }}
        </div>
        <div v-if="isVisible('trainer-groups')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'trainer-groups' }" @click="navigateTo('trainer-groups', '/trainer/groups')">
          <span class="nav-icon">🎓</span> {{ t('sidebar.trainerGroups') }}
        </div>
        <div v-if="isVisible('lesson-tracker')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'lesson-tracker' }" @click="navigateTo('lesson-tracker', '/trainer/lesson-tracker')">
          <span class="nav-icon">📝</span> {{ t('sidebar.trainerLessonTracker') }}
        </div>
        <div v-if="isVisible('salary-demo')" class="nav-item" :class="[{ active: activeItem === 'salary-demo' }, accessClass('salary-demo')]" @click="navigateTo('salary-demo', '/teacher/salary')">
          <span class="nav-icon">💰</span> {{ t('sidebar.trainerSalary') }}
        </div>
        <div v-if="isVisible('trainer-materials')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'trainer-materials' }" @click="navigateTo('trainer-materials', '/trainer/materials')">
          <span class="nav-icon">📚</span> {{ t('sidebar.trainerMaterials') }}
        </div>
        <div v-if="isVisible('trainer-exam')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'trainer-exam' }" @click="navigateTo('trainer-exam', '/trainer/exam')">
          <span class="nav-icon">📜</span> {{ t('sidebar.trainerExam') }}
        </div>
        <div v-if="isVisible('trainer-mail')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'trainer-mail' }" @click="navigateTo('trainer-mail', '/trainer/mail')">
          <span class="nav-icon">✉️</span> {{ t('sidebar.trainerMail') }}
          <span class="nav-badge blue">7</span>
        </div>
      </div>

      <!-- RECRUITMENT (SPACE) -->
      <div
        v-if="isSectionAllowed('recruitment') && projectStore.usesDefaultRecruitment"
        class="nav-section"
        :class="{ open: openSections.recruitment }"
        @click="toggleSection('recruitment')"
      >
        <span class="nav-section-icon">🎯</span>
        <span class="nav-section-label">{{ t('sidebar.recruitment') }}</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div v-if="isSectionAllowed('recruitment') && projectStore.usesDefaultRecruitment" class="nav-children" :class="{ open: openSections.recruitment }">
        <div v-if="isVisible('new-students')" class="nav-item" :class="[{ active: activeItem === 'new-students' }, accessClass('new-students')]" @click="navigateTo('new-students', '/recruitment/space/new-students')">
          <span class="nav-icon">🌟</span> {{ t('sidebar.newStudents') }}
        </div>
        <div v-if="isVisible('leads')" class="nav-item" :class="[{ active: activeItem === 'leads' }, accessClass('leads')]" @click="navigateTo('leads', '/recruitment/space/leads')">
          <span class="nav-icon">📋</span> {{ t('sidebar.leads') }}
        </div>
        <div v-if="isVisible('target-mail')" class="nav-item" :class="[{ active: activeItem === 'target-mail' }, accessClass('target-mail')]" @click="navigateTo('target-mail', '/recruitment/space/target-mail')">
          <span class="nav-icon">✉️</span> {{ t('sidebar.targetMail') }}
        </div>
        <div v-if="isVisible('expelled')" class="nav-item" :class="[{ active: activeItem === 'expelled' }, accessClass('expelled')]" @click="navigateTo('expelled', '/recruitment/space/expelled-students')">
          <span class="nav-icon">📤</span> {{ t('sidebar.expelled') }}
        </div>
        <div v-if="isVisible('new-groups')" class="nav-item" :class="[{ active: activeItem === 'new-groups' }, accessClass('new-groups')]" @click="navigateTo('new-groups', '/recruitment/space/new-groups')">
          <span class="nav-icon">🚀</span> {{ t('sidebar.newGroups') }}
        </div>
        <div v-if="isVisible('archived')" class="nav-item" :class="[{ active: activeItem === 'archived' }, accessClass('archived')]" @click="navigateTo('archived', '/recruitment/space/archived-students')">
          <span class="nav-icon">📁</span> {{ t('sidebar.archive') }}
        </div>
        <div v-if="isVisible('import-db')" class="nav-item" :class="[{ active: activeItem === 'import-db' }, accessClass('import-db')]" @click="navigateTo('import-db', '/recruitment/space/import-db')">
          <span class="nav-icon">📥</span> {{ t('sidebar.importDb') }}
        </div>
      </div>

      <!-- RECRUITMENT (INDIGO) -->
      <div
        v-if="isSectionAllowed('recruitment') && projectStore.isIndigo"
        class="nav-section"
        :class="{ open: openSections.recruitmentIndigo }"
        @click="toggleSection('recruitmentIndigo')"
      >
        <span class="nav-section-icon">🟣</span>
        <span class="nav-section-label">{{ `${t('sidebar.recruitment')} Indigo` }}</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div v-if="isSectionAllowed('recruitment') && projectStore.isIndigo" class="nav-children" :class="{ open: openSections.recruitmentIndigo }">
        <div v-if="isVisible('new-students')" class="nav-item" :class="[{ active: activeItem === 'new-students-indigo' }, accessClass('new-students')]" @click="navigateTo('new-students-indigo', '/recruitment/indigo/new-students', 'new-students')">
          <span class="nav-icon">🌟</span> {{ t('sidebar.newStudents') }}
        </div>
        <div v-if="isVisible('leads')" class="nav-item" :class="[{ active: activeItem === 'leads-indigo' }, accessClass('leads')]" @click="navigateTo('leads-indigo', '/recruitment/indigo/leads', 'leads')">
          <span class="nav-icon">📋</span> {{ t('sidebar.leads') }}
        </div>
        <div v-if="isVisible('target-mail')" class="nav-item" :class="[{ active: activeItem === 'target-mail-indigo' }, accessClass('target-mail')]" @click="navigateTo('target-mail-indigo', '/recruitment/indigo/target-mail', 'target-mail')">
          <span class="nav-icon">✉️</span> {{ t('sidebar.targetMail') }}
        </div>
        <div v-if="isVisible('expelled')" class="nav-item" :class="[{ active: activeItem === 'expelled-indigo' }, accessClass('expelled')]" @click="navigateTo('expelled-indigo', '/recruitment/indigo/expelled-students', 'expelled')">
          <span class="nav-icon">📤</span> {{ t('sidebar.expelled') }}
        </div>
        <div v-if="isVisible('new-groups')" class="nav-item" :class="[{ active: activeItem === 'new-groups-indigo' }, accessClass('new-groups')]" @click="navigateTo('new-groups-indigo', '/recruitment/indigo/new-groups', 'new-groups')">
          <span class="nav-icon">🚀</span> {{ t('sidebar.newGroups') }}
        </div>
        <div v-if="isVisible('archived')" class="nav-item" :class="[{ active: activeItem === 'archived-indigo' }, accessClass('archived')]" @click="navigateTo('archived-indigo', '/recruitment/indigo/archived-students', 'archived')">
          <span class="nav-icon">📁</span> {{ t('sidebar.archive') }}
        </div>
        <div v-if="isVisible('import-db')" class="nav-item" :class="[{ active: activeItem === 'import-db-indigo' }, accessClass('import-db')]" @click="navigateTo('import-db-indigo', '/recruitment/indigo/import-db', 'import-db')">
          <span class="nav-icon">📥</span> {{ t('sidebar.importDb') }}
        </div>
      </div>

      <div
        v-if="isSectionAllowed('finance')"
        class="nav-section"
        :class="{ open: openSections.finance }"
        @click="toggleSection('finance')"
      >
        <span class="nav-section-icon">💫</span>
        <span class="nav-section-label">{{ t('sidebar.finance') }}</span>
        <span class="nav-section-badge nb-red">7</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div v-if="isSectionAllowed('finance')" class="nav-children" :class="{ open: openSections.finance }">
        <div v-if="isVisible('student-finance')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'student-finance' }" @click="navigateTo('student-finance', '/finance/students')">
          <span class="nav-icon">💰</span> {{ t('sidebar.studentFinance') }}
        </div>
        <div v-if="isVisible('debtors')" class="nav-item" :class="{ active: activeItem === 'debtors' }" @click="navigateTo('debtors', '/finance/debtors')">
          <span class="nav-icon">🔴</span> {{ t('sidebar.debtors') }}
          <span class="nav-badge" v-if="debtors > 0">{{ debtors }}</span>
        </div>
        <div v-if="isVisible('nadplaty')" class="nav-item" :class="{ active: activeItem === 'nadplaty' }" @click="navigateTo('nadplaty', '/finance/nadplaty')">
          <span class="nav-icon">💙</span> {{ t('sidebar.nadplaty') }}
          <span class="nav-badge cyan">3</span>
        </div>
        <div v-if="isVisible('contractors')" class="nav-item" :class="{ active: activeItem === 'contractors' }" @click="navigateTo('contractors', '/finance/contractors')">
          <span class="nav-icon">🏢</span> {{ t('sidebar.contractors') }}
        </div>
        <div v-if="isVisible('cohorts')" class="nav-item" :class="[{ active: activeItem === 'cohorts' }, accessClass('cohorts')]" @click="navigateTo('cohorts', '/finance/cohorts')">
          <span class="nav-icon">📊</span> {{ t('sidebar.cohorts') }}
        </div>
        <div 
          v-if="isVisible('settings')"
          class="nav-item"
          :class="[{ active: activeItem === 'settings' }, accessClass('settings')]"
          @click="setActive('settings')"
        >
          <span class="nav-icon">⚙️</span> {{ t('sidebar.settings') }}
        </div>
      </div>

      <!-- БУХГАЛТЕРИЯ -->
      <div v-if="isSectionAllowed('accounting')" class="nav-section" :class="{ open: openSections.accounting }" @click="toggleSection('accounting')">
        <span class="nav-section-icon">🧾</span>
        <span class="nav-section-label">{{ t('sidebar.accounting') }}</span>
        <span class="nav-section-badge nb-cyan" v-if="pendingReturns > 0">{{ pendingReturns }}</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div v-if="isSectionAllowed('accounting')" class="nav-children" :class="{ open: openSections.accounting }">
        <div v-if="isVisible('faktury')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'faktury' }" @click="navigateTo('faktury', '/accounting/faktury')">
          <span class="nav-icon">🧾</span> {{ t('sidebar.faktury') }}
        </div>
        <div v-if="isVisible('returns')" class="nav-item" :class="[{ active: activeItem === 'returns' }, accessClass('returns')]" @click="navigateTo('returns', '/finance/returns')">
          <span class="nav-icon">↩️</span> {{ t('sidebar.returns') }}
          <span class="nav-badge cyan" v-if="pendingReturns > 0">{{ pendingReturns }}</span>
        </div>
        <div v-if="isVisible('projects')" class="nav-item" :class="[{ active: activeItem === 'projects' }, accessClass('projects')]" @click="navigateTo('projects', '/projects')">
          <span class="nav-icon">📁</span> {{ t('sidebar.projects') }}
        </div>
        <div v-if="isVisible('salary-calculator')" class="nav-item" :class="[{ active: activeItem === 'salary-calculator' }, accessClass('salary-calculator')]" @click="navigateTo('salary-calculator', '/finance/salary-calculator')">
          <span class="nav-icon">🧮</span> {{ t('sidebar.salaryCalculator') }}
        </div>
        <div v-if="isVisible('finance-ustawienia')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'settings' }" @click="navigateTo('settings', '/finance/settings-ustawienia', 'finance-ustawienia')">
          <span class="nav-icon">🔧</span> {{ t('sidebar.ustawienia') }}
        </div>
      </div>

      <!-- ОТДЕЛ КАЧЕСТВА -->
      <div v-if="isSectionAllowed('quality')" class="nav-section" :class="{ open: openSections.quality }" @click="toggleSection('quality')">
        <span class="nav-section-icon">🎯</span>
        <span class="nav-section-label">{{ t('sidebar.quality') }}</span>
        <span class="nav-section-badge nb-red" v-if="rezygnajeCount > 0">{{ rezygnajeCount }}</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div v-if="isSectionAllowed('quality')" class="nav-children" :class="{ open: openSections.quality }">
        <div v-if="isVisible('rezygnacje')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'rezygnacje' }" @click="navigateTo('rezygnacje', '/quality/rezygnacje')">
          <span class="nav-icon">🚪</span> {{ t('sidebar.rezygnacje') }}
          <span class="nav-badge" v-if="rezygnajeCount > 0">{{ rezygnajeCount }}</span>
        </div>
        <div v-if="isVisible('holidays-return')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'holidays-return' }" @click="navigateTo('holidays-return', '/quality/holidays-return')">
          <span class="nav-icon">🌙</span> {{ t('sidebar.holidaysReturn') }}
          <span class="nav-badge amber">4</span>
        </div>
        <div v-if="isVisible('quality-monitoring')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'quality-monitoring' }" @click="navigateTo('quality-monitoring', '/quality/monitoring')">
          <span class="nav-icon">🔍</span> {{ t('sidebar.qualityMonitoring') }}
        </div>
        <div v-if="isVisible('quality-analytics')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'quality-analytics' }" @click="navigateTo('quality-analytics', '/quality/analytics')">
          <span class="nav-icon">📊</span> {{ t('sidebar.qualityAnalytics') }}
        </div>
        <div v-if="isVisible('trial-lessons-qd')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'trial-lessons-qd' }" @click="navigateTo('trial-lessons-qd', '/quality/trial-lessons')">
          <span class="nav-icon">⭐</span> {{ t('sidebar.trialLessonsQd') }}
        </div>
        <div v-if="isVisible('quality-zaliczenia')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'quality-zaliczenia' }" @click="navigateTo('quality-zaliczenia', '/quality/zaliczenia')">
          <span class="nav-icon">✔️</span> {{ t('sidebar.qualityZaliczenia') }}
        </div>
        <div v-if="isVisible('quality-olimpiad')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'quality-olimpiad' }" @click="navigateTo('quality-olimpiad', '/quality/olimpiad')">
          <span class="nav-icon">🏆</span> {{ t('sidebar.qualityOlimpiad') }}
        </div>
        <div v-if="isVisible('spotkania')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'spotkania' }" @click="navigateTo('spotkania', '/quality/spotkania')">
          <span class="nav-icon">🤝</span> {{ t('sidebar.spotkania') }}
        </div>
        <div v-if="isVisible('sciezka')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'sciezka' }" @click="navigateTo('sciezka', '/quality/sciezka')">
          <span class="nav-icon">🛤️</span> {{ t('sidebar.sciezka') }}
        </div>
        <div v-if="isVisible('quality-materials')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'quality-materials' }" @click="navigateTo('quality-materials', '/quality/materials')">
          <span class="nav-icon">📚</span> {{ t('sidebar.qualityMaterials') }}
        </div>
        <div v-if="isVisible('zaliczenia-calendar')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'zaliczenia-calendar' }" @click="navigateTo('zaliczenia-calendar', '/quality/zaliczenia-calendar')">
          <span class="nav-icon">📅</span> {{ t('sidebar.zaliczeniaCalendar') }}
        </div>
        <div v-if="isVisible('all-tasks')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'all-tasks' }" @click="navigateTo('all-tasks', '/quality/all-tasks')">
          <span class="nav-icon">📋</span> {{ t('sidebar.allTasks') }}
          <span class="nav-badge blue">8</span>
        </div>
        <div v-if="isVisible('quality-stats')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'quality-stats' }" @click="navigateTo('quality-stats', '/quality/stats')">
          <span class="nav-icon">📉</span> {{ t('sidebar.qualityStats') }}
        </div>
      </div>

      <!-- НАСТРОЙКИ -->
      <div v-if="isSectionAllowed('settings-section')" class="nav-section" :class="{ open: openSections.settings }" @click="toggleSection('settings')">
        <span class="nav-section-icon">⚙️</span>
        <span class="nav-section-label">{{ t('sidebar.settings') }}</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div v-if="isSectionAllowed('settings-section')" class="nav-children" :class="{ open: openSections.settings }">
        <div v-if="isVisible('indigo-techniques')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'indigo-techniques' }" @click="setActive('indigo-techniques')">
          <span class="nav-icon">🧩</span> {{ t('sidebar.indigoTechniques') }}
        </div>
        <div v-if="isVisible('school-settings')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'school-settings' }" @click="setActive('school-settings')">
          <span class="nav-icon">🏫</span> {{ t('sidebar.schoolSettings') }}
        </div>
        <div 
          v-if="isVisible('access-control')" 
          class="nav-item" 
          :class="[{ active: activeItem === 'access-control' }, accessClass('access-control')]" 
          @click="navigateTo('access-control', '/settings/access-control')"
        >
          <span class="nav-icon">🔐</span> {{ t('sidebar.accessControl') }}
        </div>
        <div v-if="isVisible('integrations')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'integrations' }" @click="setActive('integrations')">
          <span class="nav-icon">🔌</span> {{ t('sidebar.integrations') }}
          <span class="nav-badge blue">KSeF</span>
        </div>
        <div v-if="isVisible('reports')" class="nav-item nav-item--stub" :class="{ active: activeItem === 'reports' }" @click="setActive('reports')">
          <span class="nav-icon">📄</span> {{ t('sidebar.reports') }}
        </div>
      </div>

    </nav>

    <div class="sidebar-lang">
      <select class="lang-select" :value="locale" @change="onLocale(($event.target as HTMLSelectElement).value)">
        <option value="ru">Русский</option>
        <option value="uk">🇺🇦 Українська</option>
        <option value="pl">🇵🇱 Polski</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>

    <div class="sidebar-bottom" v-if="authStore.user">
      <div class="user-card">
        <div class="user-avatar">{{ authStore.user?.initials || '??' }}</div>
        <div class="user-info">
          <div class="user-name">{{ authStore.user?.name || 'User' }}</div>
          <div class="user-role">{{ authStore.user?.role || 'Admin' }}</div>
        </div>
        <button class="logout-btn" @click.stop="handleLogout" :title="t('app.logout')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../app/i18n'
import { useNotificationStore } from '../../stores/notification.store'
import { getMenuAccessReason, isMenuBlocked, isMenuVisible, isSectionVisible } from '../../utils/menuAccess'
import type { ProjectCode } from '../../config/projectApi'
import { normalizeRole } from '../../config/roleMenuAccess.config'

// Подключаем сторы
import { useStudentsListStore } from '../../stores/studentsList.store'
import { useGroupsListStore } from '../../stores/groupsList.store'
import { useTeachersListStore } from '../../stores/teachersList.store'
import { useAuthStore } from '../../stores/auth.store'
import { useAppStore } from '../../stores/app.store'
import { useProjectStore } from '../../stores/project.store'
import { useAccessStore } from '../../stores/access.store'

const router = useRouter()
const route = useRoute()
const { locale, t } = useI18n()

// Инициализируем сторы
const listStore = useStudentsListStore()
const groupsListStore = useGroupsListStore()
const teachersListStore = useTeachersListStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const appStore = useAppStore()
const projectStore = useProjectStore()
const accessStore = useAccessStore()

// Показываем только те проекты, которые доступны пользователю по роли
// admin / super-admin видят все проекты; остальные — только текущий
const visibleProjectOptions = computed(() => {
  const role = normalizeRole(accessStore.role)
  if (role === 'admin' || role === 'super-admin') {
    return projectStore.projectOptions
  }
  // Остальные роли — показываем только активный проект (нет переключения)
  return projectStore.projectOptions.filter(p => p.code === projectStore.activeProject)
})

const isProjectDropdownOpen = ref(false)

function toggleProjectDropdown() {
  isProjectDropdownOpen.value = !isProjectDropdownOpen.value
}

function selectProject(project: ProjectCode) {
  projectStore.setProject(project)
  isProjectDropdownOpen.value = false
  
  // При смене проекта переходим на дашборд этого проекта или оставляем пользователя где он есть
  // Если пользователь в рекрутации, можно попробовать перекинуть на ту же страницу другого проекта
  const currentPath = route.path
  if (currentPath.includes('/recruitment/')) {
    const targetPath = currentPath.replace(
      project === 'indigo' ? '/recruitment/space/' : '/recruitment/indigo/',
      project === 'indigo' ? '/recruitment/indigo/' : '/recruitment/space/'
    )
    router.push(targetPath)
  }
}

// Логика смены языка
function onLocale(l: string) {
  setLocale(l as any)
}

// Функция выхода
const handleLogout = () => {
  if (authStore.logout) {
    authStore.logout()
  }
  router.push('/auth/sign-in')
}

// Заглушки счетчиков
const hrCandidates   = ref(8)
const trainerTasks   = ref(4)
const debtors        = ref(7)
const pendingReturns = ref(2)
const rezygnajeCount = ref(11)
const unreadNews     = ref(3)

const openSections = ref<Record<string, boolean>>({
  secretariat: true,
  finance: false,
  recruitment: false,
  recruitmentIndigo: false,
  hr: false,
  trainer: false,
  accounting: false,
  quality: false,
  settings: authStore.user?.role === 'super-admin' || authStore.user?.role === 'admin',
})

const activeItem = ref('students')

watch(() => route.path, (path) => {
  if (path.startsWith('/recruitment/indigo/leads')) {
    activeItem.value = 'leads-indigo'
    openSections.value.recruitmentIndigo = true
  } else if (path.startsWith('/recruitment/indigo/target-mail')) {
    activeItem.value = 'target-mail-indigo'
    openSections.value.recruitmentIndigo = true
  } else if (path.startsWith('/recruitment/indigo/new-students')) {
    activeItem.value = 'new-students-indigo'
    openSections.value.recruitmentIndigo = true
  } else if (path.startsWith('/recruitment/indigo/new-groups')) {
    activeItem.value = 'new-groups-indigo'
    openSections.value.recruitmentIndigo = true
  } else if (path.startsWith('/recruitment/indigo/expelled-students')) {
    activeItem.value = 'expelled-indigo'
    openSections.value.recruitmentIndigo = true
  } else if (path.startsWith('/recruitment/indigo/archived-students')) {
    activeItem.value = 'archived-indigo'
    openSections.value.recruitmentIndigo = true
  } else if (path.startsWith('/recruitment/space/leads')) {
    activeItem.value = 'leads'
    openSections.value.recruitment = true
  } else if (path.startsWith('/recruitment/space/target-mail')) {
    activeItem.value = 'target-mail'
    openSections.value.recruitment = true
  } else if (path.startsWith('/recruitment/space/new-students')) {
    activeItem.value = 'new-students'
    openSections.value.recruitment = true
  } else if (path.startsWith('/recruitment/space/new-groups')) {
    activeItem.value = 'new-groups'
    openSections.value.recruitment = true
  } else if (path.startsWith('/recruitment/space/expelled-students')) {
    activeItem.value = 'expelled'
    openSections.value.recruitment = true
  } else if (path.startsWith('/recruitment/space/archived-students')) {
    activeItem.value = 'archived'
    openSections.value.recruitment = true
  } else if (path.startsWith('/recruitment/indigo/import-db')) {
    activeItem.value = 'import-db-indigo'
    openSections.value.recruitmentIndigo = true
  } else if (path.startsWith('/recruitment/space/import-db')) {
    activeItem.value = 'import-db'
    openSections.value.recruitment = true
  } else if (path.startsWith('/finance/returns')) {
    activeItem.value = 'returns'
    openSections.value.accounting = true
  } else if (path.startsWith('/projects')) {
    activeItem.value = 'projects'
    openSections.value.accounting = true
  } else if (path.startsWith('/students')) {
    activeItem.value = 'students'
  } else if (path.startsWith('/teacher/salary')) {
    activeItem.value = 'salary-demo'
    openSections.value.trainer = true
  } else if (path.startsWith('/finance/salary-calculator')) {
    activeItem.value = 'salary-calculator'
    openSections.value.accounting = true
  } else if (path === '/' || path === '/dashboard') {
    activeItem.value = 'dashboard'

  // HR
  } else if (path.startsWith('/hr/active'))    { activeItem.value = 'hr-active';    openSections.value.hr = true }
  else if (path.startsWith('/hr/training'))  { activeItem.value = 'hr-training';  openSections.value.hr = true }
  else if (path.startsWith('/hr/pipeline'))  { activeItem.value = 'hr-pipeline';  openSections.value.hr = true }
  else if (path.startsWith('/hr/personal'))  { activeItem.value = 'hr-personal';  openSections.value.hr = true }
  else if (path.startsWith('/hr/analytics')) { activeItem.value = 'hr-analytics'; openSections.value.hr = true }
  // Кабинет тренера
  else if (path.startsWith('/trainer/dashboard'))     { activeItem.value = 'trainer-dashboard';    openSections.value.trainer = true }
  else if (path.startsWith('/trainer/students'))      { activeItem.value = 'trainer-students';     openSections.value.trainer = true }
  else if (path.startsWith('/trainer/groups'))        { activeItem.value = 'trainer-groups';       openSections.value.trainer = true }
  else if (path.startsWith('/trainer/lesson-tracker')){ activeItem.value = 'lesson-tracker';       openSections.value.trainer = true }
  else if (path.startsWith('/trainer/tasks'))         { activeItem.value = 'trainer-tasks';        openSections.value.trainer = true }
  else if (path.startsWith('/trainer/trial-lesson'))  { activeItem.value = 'trial-lesson';         openSections.value.trainer = true }
  else if (path.startsWith('/trainer/trial-month'))   { activeItem.value = 'trial-month';          openSections.value.trainer = true }
  else if (path.startsWith('/trainer/zaliczenia'))    { activeItem.value = 'trainer-zaliczenia';   openSections.value.trainer = true }
  else if (path.startsWith('/trainer/olimpiad'))      { activeItem.value = 'olimpiad';             openSections.value.trainer = true }
  // Финансы (новые)
  else if (path.startsWith('/finance/students'))  { activeItem.value = 'student-finance';  openSections.value.finance = true }
  else if (path.startsWith('/finance/debtors'))   { activeItem.value = 'debtors';          openSections.value.finance = true }
  else if (path.startsWith('/finance/nadplaty'))  { activeItem.value = 'nadplaty';         openSections.value.finance = true }
  else if (path.startsWith('/finance/cohorts'))   { activeItem.value = 'cohorts';          openSections.value.finance = true }
  // Бухгалтерия
  else if (path.startsWith('/accounting/faktury'))         { activeItem.value = 'faktury';           openSections.value.accounting = true }
  else if (path.startsWith('/finance/settings-ustawienia')){ activeItem.value = 'settings';          openSections.value.accounting = true }
  // Отдел качества
  else if (path.startsWith('/quality/rezygnacje'))         { activeItem.value = 'rezygnacje';         openSections.value.quality = true }
  else if (path.startsWith('/quality/holidays'))           { activeItem.value = 'holidays-return';    openSections.value.quality = true }
  else if (path.startsWith('/quality/monitoring'))         { activeItem.value = 'quality-monitoring'; openSections.value.quality = true }
  else if (path.startsWith('/quality/analytics'))          { activeItem.value = 'quality-analytics';  openSections.value.quality = true }
  else if (path.startsWith('/quality/trial'))              { activeItem.value = 'trial-lessons-qd';   openSections.value.quality = true }
  else if (path.startsWith('/quality/zaliczenia-calendar')){ activeItem.value = 'zaliczenia-calendar';openSections.value.quality = true }
  else if (path.startsWith('/quality/zaliczenia'))         { activeItem.value = 'quality-zaliczenia'; openSections.value.quality = true }
  else if (path.startsWith('/quality/olimpiad'))           { activeItem.value = 'quality-olimpiad';   openSections.value.quality = true }
  else if (path.startsWith('/quality/spotkania'))          { activeItem.value = 'spotkania';          openSections.value.quality = true }
  else if (path.startsWith('/quality/sciezka'))            { activeItem.value = 'sciezka';            openSections.value.quality = true }
  else if (path.startsWith('/quality/materials'))          { activeItem.value = 'quality-materials';  openSections.value.quality = true }
  else if (path.startsWith('/quality/all-tasks'))          { activeItem.value = 'all-tasks';          openSections.value.quality = true }
  else if (path.startsWith('/quality/stats'))              { activeItem.value = 'quality-stats';      openSections.value.quality = true }
  // Финансы настройки - ставится под Бухгалтерией и над Мой Кабинет/прочими 
  else if (path.startsWith('/finance/settings'))           { activeItem.value = 'finance-settings';   openSections.value.finance = true }
  // Группы
  else if (path.startsWith('/groups')) { activeItem.value = 'groups'; openSections.value.secretariat = true }
  // Преподаватели
  else if (path.startsWith('/teachers')) { activeItem.value = 'teachers'; openSections.value.secretariat = true }
  // Секретариат - новые пункты
  else if (path.startsWith('/secretariat/course-endings')) { activeItem.value = 'course-endings'; openSections.value.secretariat = true }
  // Тренер - новые пункты
  else if (path.startsWith('/trainer/materials')) { activeItem.value = 'trainer-materials'; openSections.value.trainer = true }
  else if (path.startsWith('/trainer/exam'))     { activeItem.value = 'trainer-exam';      openSections.value.trainer = true }
  else if (path.startsWith('/trainer/mail'))     { activeItem.value = 'trainer-mail';      openSections.value.trainer = true }
  // Мой кабинет
}, { immediate: true })

// Автоматически раскрываем раздел настроек для админов, когда данные пользователя загружены
watch(() => authStore.user?.role, (newRole) => {
  if (newRole === 'super-admin' || newRole === 'admin') {
    openSections.value.settings = true
  }
}, { immediate: true })

function isVisible(menuKey: string) {
  return isMenuVisible(menuKey)
}

function isSectionAllowed(sectionKey: string) {
  return isSectionVisible(sectionKey)
}

function accessClass(menuKey: string) {
  return {
    'nav-item--blocked': isMenuBlocked(menuKey),
  }
}

function notifyBlocked(menuKey: string) {
  const reason = getMenuAccessReason(menuKey)
  notificationStore.addToast(reason || 'Раздел заблокирован для вашей роли', 'warning')
}

function canOpen(menuKey: string): boolean {
  if (!isVisible(menuKey)) return false
  if (isMenuBlocked(menuKey)) {
    notifyBlocked(menuKey)
    return false
  }
  return true
}

const toggleSection = (section: string) => {
  const permissionKey = section === 'settings'
    ? 'settings-section'
    : section === 'recruitmentIndigo'
      ? 'recruitment'
      : section
  if (!isSectionAllowed(permissionKey)) return
  openSections.value[section] = !openSections.value[section]
}

const setActive = (item: string) => {
  if (!canOpen(item)) return
  activeItem.value = item
  if (item === 'dashboard') {
    router.push('/')
  } else if (item === 'students') {
    router.push('/students')
  } else if (item === 'settings') {
    router.push('/settings')
  }
}

const navigateTo = (item: string, path: string, menuKey = item) => {
  if (!canOpen(menuKey)) return
  activeItem.value = item
  router.push(path)
}

</script>

<style scoped>
.sidebar { 
  position: fixed; left: 0; top: 0; bottom: 0; width: 240px; 
  background: var(--app-sidebar); border-right: 1px solid var(--app-border); 
  z-index: 100; display: flex; flex-direction: column; backdrop-filter: blur(20px); 
}
.sidebar-logo { padding: 20px 16px 16px; border-bottom: 1px solid var(--app-border); flex-shrink: 0; }
.logo-badge { display: flex; align-items: center; gap: 12px; }
.logo-icon { 
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
}
.logo-text { font-size: 15px; font-weight: 800; color: var(--app-text-main); letter-spacing: 0.01em; }
.logo-sub { font-size: 9.5px; color: var(--app-text-dim); font-family: 'Space Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 1px; }
.brand-logo {
  height: 42px;
  width: auto;
  object-fit: contain;
  background: transparent !important;
}

.school-pill { margin-top: 10px; display: flex; align-items: center; gap: 7px; padding: 6px 9px; background: rgba(79,110,247,0.07); border: 1px solid rgba(79,110,247,0.18); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.school-pill:hover { background: rgba(79,110,247,0.12); border-color: rgba(79,110,247,0.3); }
.school-pill.no-switch { cursor: default; }
.school-pill.no-switch:hover { background: rgba(79,110,247,0.07); border-color: rgba(79,110,247,0.18); }
.school-pill.dropdown-open { background: var(--status-info-bg); border-color: var(--blue); }
.school-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981; flex-shrink: 0; }
.school-dot.dot-space { background: #10b981; box-shadow: 0 0 6px #10b981; }
.school-dot.dot-space-ua { background: #3b82f6; box-shadow: 0 0 6px #3b82f6; }
.school-dot.dot-indigo { background: #8b5cf6; box-shadow: 0 0 6px #8b5cf6; }
.project-info { flex: 1; }
.school-name { font-size: 11.5px; font-weight: 600; color: var(--app-text-main); }
.school-city { font-size: 10px; color: var(--app-text-dim); }
.selector-arrow { font-size: 8px; color: var(--app-text-dim); margin-left: auto; }

.project-selector-container { position: relative; }
.project-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: var(--app-sidebar);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 10;
  padding: 5px;
  backdrop-filter: blur(20px);
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--app-text-dim);
  transition: all 0.15s;
}
.dropdown-item:hover { background: var(--status-info-bg); color: var(--app-text-main); }
.dropdown-item.active { background: rgba(79,110,247,0.1); color: var(--app-text-main); font-weight: 600; }

.sidebar-nav { padding: 10px; flex: 1; overflow-y: auto; }
.sidebar-nav::-webkit-scrollbar { width: 3px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(79,110,247,0.2); border-radius: 2px; }

.nav-section { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 9px; cursor: pointer; margin-top: 3px; margin-bottom: 1px; transition: all 0.18s; position: relative; user-select: none; }
.nav-section:hover { background: var(--status-info-bg); }
.nav-section.open { background: var(--status-info-bg); }
.nav-section-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
.nav-section-label { font-size: 12.5px; font-weight: 700; color: var(--app-text-main); flex: 1; }
.nav-section-arrow { font-size: 10px; color: var(--app-text-dim); transition: transform 0.2s; flex-shrink: 0; }
.nav-section.open .nav-section-arrow { transform: rotate(90deg); }

.nav-children { overflow: hidden; max-height: 0; transition: max-height 0.28s cubic-bezier(0.4,0,0.2,1); padding-left: 12px; }
.nav-children.open { max-height: 500px; }

.nav-item, .nav-standalone { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-radius: 7px; cursor: pointer; transition: all 0.15s; color: var(--app-text-dim); font-size: 12.5px; font-weight: 400; margin-bottom: 1px; position: relative; }
.nav-item:hover, .nav-standalone:hover { background: var(--status-info-bg); color: var(--app-text-main); }
.nav-item.active, .nav-standalone.active { background: linear-gradient(90deg, var(--status-info-bg), rgba(139,92,246,0.1)); color: var(--app-text-main); border: 1px solid var(--app-border-hi); }
.nav-item.active::before, .nav-standalone.active::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px; background: linear-gradient(180deg, var(--blue), var(--purple)); border-radius: 2px; }
.nav-item--blocked, .nav-standalone.nav-item--blocked { opacity: 0.6; }
.nav-item--blocked::after, .nav-standalone.nav-item--blocked::after {
  content: '🔒';
  margin-left: auto;
  font-size: 11px;
}

.nav-icon { font-size: 13px; width: 16px; text-align: center; flex-shrink: 0; }
.nav-badge { margin-left: auto; color: white; font-size: 9.5px; font-weight: 700; font-family: 'Space Mono', monospace; padding: 1px 5px; border-radius: 8px; }
.nav-badge.green { background: #10b981; }
.nav-badge.blue { background: #4f6ef7; }
.nav-badge.red { background: #ef4444; }
.nav-badge.cyan { background: #06b6d4; }
.nav-section-badge { font-size: 9.5px; font-weight: 700; padding: 1px 5px; border-radius: 8px; margin-right: 5px; }
.nb-red { background: #ef4444; color: #fff; }
.nb-green { background: #10b981; color: #fff; }

/* === Стили для селекта языка === */
.sidebar-lang { padding: 0 16px 10px; flex-shrink: 0; }
.lang-select {
  width: 100%;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  color: var(--app-text-dim);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.lang-select:hover {
  background: var(--status-info-bg);
  color: var(--app-text-main);
  border-color: var(--app-border-hi);
}
.lang-select option {
  background: var(--app-surface);
  color: var(--app-text-main);
}

.sidebar-bottom { padding: 14px 10px; border-top: 1px solid var(--app-border); flex-shrink: 0; }
.user-card { display: flex; align-items: center; gap: 9px; padding: 7px 8px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.user-card:hover { background: rgba(255,255,255,0.04); }
.user-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: white; flex-shrink: 0; }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 12px; font-weight: 600; color: var(--app-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 10px; color: var(--app-text-dim); }

.logout-btn { background: transparent; border: none; color: var(--app-text-dim); cursor: pointer; padding: 8px; border-radius: 8px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; margin-left: auto; }
.logout-btn svg { transition: transform 0.2s ease; }
.logout-btn:hover { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
.logout-btn:hover svg { transform: translateX(2px); }

.nav-item--stub {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}
</style>