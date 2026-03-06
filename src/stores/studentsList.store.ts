import { defineStore } from "pinia";

export const useStudentsListStore = defineStore("studentsList", {
    state: () => ({
        // Переносим твой моковый массив сюда
        students: [
            {
                id: 's_1',
                name: 'Иван Иванов',
                phone: '+48 777 000 111',
                startDate: '01.09.2023',
                daysInSystem: 124,
                enrollments: [
                    { school: 'Space Memory', group: 'Вт 17 Младшая', teacher: 'Клара Левит' },
                    { school: 'Speedy Mind Indigo', group: 'Ср 15 Младшая', teacher: 'Ханна Боян' }
                ],
                groupColor: '#4f6ef7',
                lastContact: 'Вчера',
                daysSinceContact: 1,
                staff: 'Артём',
                staffInitials: 'АР',
                avatarColor: '#f59e0b',
                comment: 'Отправил договор',
                paid: true
            },
            {
                id: 's_2',
                name: 'Мария Смирнова',
                phone: '+48 987 654 321',
                startDate: '15.08.2023',
                daysInSystem: 140,
                enrollments: [
                    { school: 'Speedy Mind Indigo', group: 'Ср 15 Младшая', teacher: 'Пиотр Ивановски' }
                ],
                groupColor: '#10b981',
                lastContact: '3 дня назад',
                daysSinceContact: 3,
                staff: 'Светлана',
                staffInitials: 'СВ',
                avatarColor: '#8b5cf6',
                comment: 'Всё отлично, мама довольна',
                paid: true
            },
            {
                id: 's_3',
                name: 'Кирилл Козлов',
                phone: '+48 111 222 333',
                startDate: '10.01.2024',
                daysInSystem: 45,
                enrollments: [
                    { school: 'Space Memory', group: 'Пт 19 Старшая', teacher: 'Анна Новак' }
                ],
                groupColor: '#f59e0b',
                lastContact: '10 дней назад',
                daysSinceContact: 10,
                staff: 'Артём',
                staffInitials: 'АР',
                avatarColor: '#f59e0b',
                comment: 'Не берет трубку',
                paid: false
            }
        ]
    }),
    getters: {
        // Геттер, который будет отдавать нам число 3 (или сколько там учеников)
        totalStudents: (state) => state.students.length
    }
});