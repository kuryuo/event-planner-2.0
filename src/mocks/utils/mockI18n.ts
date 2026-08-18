import type { Language } from "@/i18n";

type MockMessages = Record<string, { ru: string; en: string }>;

const MOCK_MESSAGES: MockMessages = {
  "auth.invalidCredentials": {
    ru: "Неверный email или пароль",
    en: "Invalid email or password",
  },
  "auth.emailPasswordRequired": {
    ru: "Email и пароль обязательны",
    en: "Email and password are required",
  },
  "auth.invalidRefreshToken": {
    ru: "Недействительный refresh token",
    en: "Invalid refresh token",
  },
  "auth.emailRequired": {
    ru: "Email обязателен",
    en: "Email is required",
  },
  "profile.avatarRequired": {
    ru: "Файл аватара обязателен",
    en: "Avatar file is required",
  },
  "profile.profession": {
    ru: "Организатор мероприятий",
    en: "Event organizer",
  },
  "profile.city": {
    ru: "Москва",
    en: "Moscow",
  },
  "profile.eventName": {
    ru: "Frontend митап",
    en: "Frontend Meetup",
  },
  "profile.eventDescription": {
    ru: "Встреча frontend-разработчиков",
    en: "Frontend developers meetup",
  },
  "profile.eventLocation": {
    ru: "Москва",
    en: "Moscow",
  },
  "profile.categoryDevelopment": {
    ru: "Разработка",
    en: "Development",
  },
  "profile.eventHackathonName": {
    ru: "Хакатон 2026",
    en: "Hackathon 2026",
  },
  "profile.eventHackathonDescription": {
    ru: "Командная разработка программных проектов",
    en: "Team software development projects",
  },
  "event.frontendMeetupName": {
    ru: "Frontend митап",
    en: "Frontend Meetup",
  },
  "event.frontendMeetupDescription": {
    ru: "Встреча frontend-разработчиков",
    en: "Frontend developers meetup",
  },
  "event.hackathonName": {
    ru: "Хакатон 2026",
    en: "Hackathon 2026",
  },
  "event.hackathonDescription": {
    ru: "Командная разработка программных проектов",
    en: "Team software development projects",
  },
  "event.archivedLectureName": {
    ru: "Архивная лекция",
    en: "Archived lecture",
  },
  "event.locationMoscow": {
    ru: "Москва",
    en: "Moscow",
  },
  "event.locationSpb": {
    ru: "Санкт-Петербург",
    en: "Saint Petersburg",
  },
  "event.mainHall": {
    ru: "Главный зал",
    en: "Main hall",
  },
  "event.errorNotFound": {
    ru: "Мероприятие не найдено",
    en: "Event not found",
  },
  "category.development": {
    ru: "Разработка",
    en: "Development",
  },
  "category.education": {
    ru: "Образование",
    en: "Education",
  },
  "category.career": {
    ru: "Карьера",
    en: "Career",
  },
  "board.user1": {
    ru: "Иван Иванов",
    en: "Ivan Ivanov",
  },
  "board.user2": {
    ru: "Пётр Петров",
    en: "Peter Petrov",
  },
  "board.columnNameRequired": {
    ru: "Название колонки обязательно",
    en: "Column name is required",
  },
  "board.columnNotFound": {
    ru: "Колонка не найдена",
    en: "Column not found",
  },
  "board.taskNotFound": {
    ru: "Задача не найдена",
    en: "Task not found",
  },
  "board.taskOrColumnNotFound": {
    ru: "Задача или колонка не найдена",
    en: "Task or column not found",
  },
  "board.columnPlanned": {
    ru: "Запланировано",
    en: "Planned",
  },
  "board.columnInProgress": {
    ru: "В работе",
    en: "In progress",
  },
  "board.columnDone": {
    ru: "Готово",
    en: "Done",
  },
  "board.taskPrepareAgendaTitle": {
    ru: "Подготовить повестку",
    en: "Prepare the agenda",
  },
  "board.taskPrepareAgendaDescription": {
    ru: "Согласовать выступления и расписание",
    en: "Align talks and schedule",
  },
  "board.taskOrderCateringTitle": {
    ru: "Заказать кейтеринг",
    en: "Order catering",
  },
  "board.taskOrderCateringDescription": {
    ru: "Выбрать меню на 100 человек",
    en: "Choose menu for 100 people",
  },
  "board.taskBookVenueTitle": {
    ru: "Забронировать площадку",
    en: "Book the venue",
  },
  "board.eventName": {
    ru: "Frontend митап",
    en: "Frontend Meetup",
  },
  "notification.newMessageTitle": {
    ru: "Новое сообщение",
    en: "New message",
  },
  "notification.newMessageText": {
    ru: "Пётр Петров отправил сообщение",
    en: "Peter Petrov sent a message",
  },
  "notification.taskAssignedTitle": {
    ru: "Назначена задача",
    en: "Task assigned",
  },
  "notification.taskAssignedText": {
    ru: 'Вам назначена задача "Подготовить повестку"',
    en: 'You were assigned the task "Prepare the agenda"',
  },
  "notification.eventInvitationTitle": {
    ru: "Приглашение на мероприятие",
    en: "Event invitation",
  },
  "notification.eventInvitationText": {
    ru: "Вас пригласили на Хакатон 2026",
    en: "You have been invited to Hackathon 2026",
  },
  "notification.invitationNotFound": {
    ru: "Приглашение не найдено",
    en: "Invitation not found",
  },
  "notification.invitedByName": {
    ru: "Анна Сидорова",
    en: "Anna Sidorova",
  },
  "chat.userPeter": {
    ru: "Пётр Петров",
    en: "Peter Petrov",
  },
  "chat.userIvan": {
    ru: "Иван Иванов",
    en: "Ivan Ivanov",
  },
  "chat.seedQuestion": {
    ru: "Привет! Во сколько начинается регистрация?",
    en: "Hi! When does the registration start?",
  },
  "chat.seedAnswer": {
    ru: "Регистрация начинается в 09:30.",
    en: "Registration starts at 09:30.",
  },
  "chat.messageTextRequired": {
    ru: "Текст сообщения обязателен",
    en: "Message text is required",
  },
  "chat.messageOrFileRequired": {
    ru: "Нужно сообщение или файл",
    en: "Message or file is required",
  },
  "chat.messageNotFound": {
    ru: "Сообщение не найдено",
    en: "Message not found",
  },
  "post.seedTitle": {
    ru: "Регистрация открыта",
    en: "Registration is open",
  },
  "post.seedText": {
    ru: "Регистрация на Frontend митап уже открыта.",
    en: "Registration is now open for the Frontend Meetup.",
  },
  "post.titleAndTextRequired": {
    ru: "Заголовок и текст обязательны",
    en: "Title and text are required",
  },
  "post.notFound": {
    ru: "Пост не найден",
    en: "Post not found",
  },
  "auth.authorizationRequired": {
    ru: "Требуется авторизация",
    en: "Authorization required",
  },
  "eventMeta.fileRequired": {
    ru: "Файл обязателен",
    en: "File is required",
  },
  "eventMeta.avatarRequired": {
    ru: "Аватар обязателен",
    en: "Avatar is required",
  },
  "eventMeta.roleNameRequired": {
    ru: "Название роли обязательно",
    en: "Role name is required",
  },
  "eventMeta.templateNameRequired": {
    ru: "Название шаблона обязательно",
    en: "Template name is required",
  },
  "attachment.eventProgram": {
    ru: "Программа мероприятия",
    en: "Event program",
  },
  "attachment.eventWebsite": {
    ru: "Сайт мероприятия",
    en: "Event website",
  },
  "attachment.fileRequired": {
    ru: "Файл обязателен",
    en: "File is required",
  },
  "attachment.urlRequired": {
    ru: "URL обязателен",
    en: "URL is required",
  },
  "attachment.fileNotFound": {
    ru: "Файл не найден",
    en: "File not found",
  },
  "attachment.notFound": {
    ru: "Вложение не найдено",
    en: "Attachment not found",
  },
  "collab.noteSeed": {
    ru: "Проверьте готовность площадки за день до мероприятия.",
    en: "Check the venue readiness one day before the event.",
  },
  "collab.commentSeed": {
    ru: "Черновик повестки уже готов.",
    en: "The draft agenda is already ready.",
  },
  "collab.historyTaskCreated": {
    ru: "Задача создана",
    en: "Task created",
  },
  "collab.historyPriorityChanged": {
    ru: "Приоритет изменён на высокий",
    en: "Priority changed to High",
  },
  "collab.noteTextRequired": {
    ru: "Текст заметки обязателен",
    en: "Note text is required",
  },
  "collab.noteNotFound": {
    ru: "Заметка не найдена",
    en: "Note not found",
  },
  "user.notFound": {
    ru: "Пользователь не найден",
    en: "User not found",
  },
  "user.ivan": {
    ru: "Иван",
    en: "Ivan",
  },
  "user.ivanov": {
    ru: "Иванов",
    en: "Ivanov",
  },
  "user.ivanovich": {
    ru: "Иванович",
    en: "Ivanovich",
  },
  "user.maria": {
    ru: "Мария",
    en: "Maria",
  },
  "user.smirnova": {
    ru: "Смирнова",
    en: "Smirnova",
  },
  "user.andreevna": {
    ru: "Андреевна",
    en: "Andreevna",
  },
  "user.professionUiUx": {
    ru: "UI/UX дизайнер",
    en: "UI/UX designer",
  },
  "user.cityKazan": {
    ru: "Казань",
    en: "Kazan",
  },
};

export const getMockLanguage = (request?: Request): Language => {
  if (typeof window !== "undefined") {
    const storedLanguage = window.localStorage.getItem("app_language");
    if (storedLanguage === "ru") {
      return "ru";
    }
    if (storedLanguage === "en") {
      return "en";
    }
  }

  const requestedLanguage =
    request?.headers.get("accept-language")?.toLowerCase() ?? "";
  if (requestedLanguage.includes("ru")) {
    return "ru";
  }
  if (requestedLanguage.includes("en")) {
    return "en";
  }

  return "en";
};

export const mockT = (
  key: keyof typeof MOCK_MESSAGES,
  request?: Request
): string => {
  const language = getMockLanguage(request);
  return MOCK_MESSAGES[key][language];
};
