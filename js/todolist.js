let idb, dbobject;

/* Functions */
let addNewHandler, addCheckbox, buildTask, displayTasks, editHandler, hideHandler, init, searchHandler, sort,
    updateStatus, deleteHandler, errorHandler, timestamp;

utils.loadShim();

/* Elements */
let search = document.getElementById('search-button');
let addNew = document.getElementById('addNew');
let savebtn = document.getElementById('save-button');
let currenttasksbox = document.getElementById('current-tasks');
let ongoingtasksbox = document.getElementById('ongoing-tasks');
let backlogtasksbox = document.getElementById('backlog-tasks');
let deletebtn = document.getElementById('delete-button');
let backbtn = document.getElementById("back-button");

/* Global variables */
let displayMode = "normal";
const OPFS_BACKUP_FILE_NAME = "todo-backup.json";
const LOCALSTORAGE_BACKUP_KEY = "todo-backup-json";
const UI_LANGUAGE_KEY = "todo-ui-language";
const UI_THEME_KEY = "todo-ui-theme";
let backupDebounceTimer = null;
let currentLanguage = "en";
let currentTheme = "default";
let draggedTaskId = null;
let draggedFromStage = null;

const SEARCH_HELP_HTML = `
<p>Searching of tasks is possible by entering a search query in the search field. The parser is based on the Nearley framework.</p>

<h3>Keywords</h3>
<ul>
    <li><code>title</code> = the title / summary of the task (text string)</li>
    <li><code>notes</code> = the notes about the task (text string)</li>
    <li><code>stage</code> = the stage the task is in (text string)</li>
    <li><code>priority</code> = the priority of the task (text string)</li>
    <li><code>ticket_reference</code> = the ticket reference string (text string)</li>
    <li><code>due</code> = the due date of the task (date string)</li>
    <li><code>resolved</code> = the resolution / completion date of the task (date string)</li>
    <li><code>done</code> = if the task is completed (boolean)</li>
    <li><code>hidden</code> = if the task is hidden (boolean)</li>
    <li><code>ticket_needed</code> = if a ticket is needed (boolean)</li>
    <li><code>id</code> = the ID of the task (number)</li>
</ul>

<h3>Operators</h3>
<ul>
    <li><code>&lt;</code> = smaller (date string, number)</li>
    <li><code>&gt;</code> = greater (date string, number)</li>
    <li><code>=</code> = equals (date string, text string, boolean, number)</li>
    <li><code>!=</code> = not equals (date string, text string, boolean, number)</li>
    <li><code>~</code> = contains (text string)</li>
    <li><code>!~</code> = not contains (text string)</li>
</ul>

<h3>Allowed values</h3>
<ul>
    <li>Text string values must begin and end with double quotes (<code>"</code>) and may contain whitespace.</li>
    <li>Double quotes inside text need escaping with a backslash (<code>\\"</code>).</li>
    <li>Date string values must begin and end with double quotes. ISO date/timestamp format is recommended.</li>
    <li>Dates are interpreted by JavaScript <code>Date.parse</code>, so common date formats should work.</li>
    <li>Boolean values are <code>true</code> or <code>false</code> without quotes.</li>
    <li>Number values are simple integers (<code>[0-9]+</code>).</li>
</ul>

<h3>Example queries</h3>
<ul>
    <li><code>title ~ "report"</code></li>
    <li><code>priority = "high" and done = false</code></li>
    <li><code>stage = "ongoing" and due &lt; "2026-12-31"</code></li>
    <li><code>hidden = true or notes ~ "archive"</code></li>
    <li><code>ticket_needed = true and ticket_reference ~ "ABC-"</code></li>
    <li><code>id &gt; 10 and resolved != ""</code></li>
</ul>
`;

const AVAILABLE_THEMES = new Set(["default", "dark", "high-contrast", "ocean", "sepia"]);

const RTL_LANGUAGES = new Set(["ar", "fa"]);

const TRANSLATIONS = {
    en: {
        menu: "Menu",
        export: "Export",
        import: "Import",
        restore_backup: "Restore backup",
        settings: "Settings",
        language: "Language",
        theme: "Theme",
        theme_default: "Default",
        theme_dark: "Dark mode",
        theme_high_contrast: "High contrast",
        theme_ocean: "Ocean",
        theme_sepia: "Sepia",
        summary: "Summary *",
        task_stage: "Task stage",
        done: "Done",
        hidden: "Hidden",
        due_date: "Due date",
        priority: "Priority",
        notes: "Notes",
        save: "Save",
        delete: "Delete",
        cancel: "Cancel",
        search: "Search",
        back_to_tasks: "Back to task view",
        current_tasks: "Current tasks",
        ongoing: "Ongoing",
        backlog: "Backlog",
        stage_current: "Current",
        stage_ongoing: "Ongoing",
        stage_backlog: "Backlog",
        priority_none: "None",
        priority_low: "Low",
        priority_medium: "Medium",
        priority_high: "High",
        no_due_date: "No due date",
        no_matching_tasks: "No matching tasks have been found...",
        restore_backup_error: "Could not restore backup. No backup found or file is invalid."
    },
    de: {
        menu: "Menü",
        export: "Exportieren",
        import: "Importieren",
        restore_backup: "Sicherung wiederherstellen",
        settings: "Einstellungen",
        language: "Sprache",
        summary: "Zusammenfassung *",
        task_stage: "Aufgabenphase",
        done: "Erledigt",
        hidden: "Versteckt",
        due_date: "Fälligkeitsdatum",
        priority: "Priorität",
        notes: "Notizen",
        save: "Speichern",
        delete: "Löschen",
        cancel: "Abbrechen",
        search: "Suchen",
        back_to_tasks: "Zur Aufgabenansicht",
        current_tasks: "Aktuelle Aufgaben",
        ongoing: "In Bearbeitung",
        backlog: "Backlog",
        stage_current: "Aktuell",
        stage_ongoing: "In Bearbeitung",
        stage_backlog: "Backlog",
        priority_none: "Keine",
        priority_low: "Niedrig",
        priority_medium: "Mittel",
        priority_high: "Hoch",
        no_due_date: "Kein Fälligkeitsdatum",
        no_matching_tasks: "Keine passenden Aufgaben gefunden...",
        restore_backup_error: "Sicherung konnte nicht wiederhergestellt werden. Keine Sicherung gefunden oder Datei ungültig."
    },
    zh: {
        menu: "菜单",
        export: "导出",
        import: "导入",
        restore_backup: "恢复备份",
        settings: "设置",
        language: "语言",
        summary: "摘要 *",
        task_stage: "任务阶段",
        done: "已完成",
        hidden: "隐藏",
        due_date: "截止日期",
        priority: "优先级",
        notes: "备注",
        save: "保存",
        delete: "删除",
        cancel: "取消",
        search: "搜索",
        back_to_tasks: "返回任务视图",
        current_tasks: "当前任务",
        ongoing: "进行中",
        backlog: "待办",
        stage_current: "当前",
        stage_ongoing: "进行中",
        stage_backlog: "待办",
        priority_none: "无",
        priority_low: "低",
        priority_medium: "中",
        priority_high: "高",
        no_due_date: "无截止日期",
        no_matching_tasks: "未找到匹配的任务...",
        restore_backup_error: "无法恢复备份。未找到备份或文件无效。"
    },
    fr: {
        menu: "Menu",
        export: "Exporter",
        import: "Importer",
        restore_backup: "Restaurer la sauvegarde",
        settings: "Parametres",
        language: "Langue",
        summary: "Resume *",
        task_stage: "Etape de tache",
        done: "Termine",
        hidden: "Cache",
        due_date: "Date limite",
        priority: "Priorite",
        notes: "Notes",
        save: "Enregistrer",
        delete: "Supprimer",
        cancel: "Annuler",
        search: "Rechercher",
        back_to_tasks: "Retour a la vue des taches",
        current_tasks: "Taches actuelles",
        ongoing: "En cours",
        backlog: "Arriere-plan",
        stage_current: "Actuel",
        stage_ongoing: "En cours",
        stage_backlog: "Arriere-plan",
        priority_none: "Aucune",
        priority_low: "Basse",
        priority_medium: "Moyenne",
        priority_high: "Haute",
        no_due_date: "Pas de date limite",
        no_matching_tasks: "Aucune tache correspondante trouvee...",
        restore_backup_error: "Impossible de restaurer la sauvegarde. Aucune sauvegarde trouvee ou fichier invalide."
    },
    es: {
        menu: "Menu",
        export: "Exportar",
        import: "Importar",
        restore_backup: "Restaurar copia",
        settings: "Configuracion",
        language: "Idioma",
        summary: "Resumen *",
        task_stage: "Etapa de tarea",
        done: "Hecho",
        hidden: "Oculto",
        due_date: "Fecha limite",
        priority: "Prioridad",
        notes: "Notas",
        save: "Guardar",
        delete: "Eliminar",
        cancel: "Cancelar",
        search: "Buscar",
        back_to_tasks: "Volver a la vista de tareas",
        current_tasks: "Tareas actuales",
        ongoing: "En curso",
        backlog: "Pendientes",
        stage_current: "Actual",
        stage_ongoing: "En curso",
        stage_backlog: "Pendientes",
        priority_none: "Ninguna",
        priority_low: "Baja",
        priority_medium: "Media",
        priority_high: "Alta",
        no_due_date: "Sin fecha limite",
        no_matching_tasks: "No se encontraron tareas coincidentes...",
        restore_backup_error: "No se pudo restaurar la copia. No se encontro copia o el archivo es invalido."
    },
    it: {
        menu: "Menu",
        export: "Esporta",
        import: "Importa",
        restore_backup: "Ripristina backup",
        settings: "Impostazioni",
        language: "Lingua",
        summary: "Riepilogo *",
        task_stage: "Fase attivita",
        done: "Fatto",
        hidden: "Nascosto",
        due_date: "Data di scadenza",
        priority: "Priorita",
        notes: "Note",
        save: "Salva",
        delete: "Elimina",
        cancel: "Annulla",
        search: "Cerca",
        back_to_tasks: "Torna alla vista attivita",
        current_tasks: "Attivita correnti",
        ongoing: "In corso",
        backlog: "Arretrato",
        stage_current: "Corrente",
        stage_ongoing: "In corso",
        stage_backlog: "Arretrato",
        priority_none: "Nessuna",
        priority_low: "Bassa",
        priority_medium: "Media",
        priority_high: "Alta",
        no_due_date: "Nessuna scadenza",
        no_matching_tasks: "Nessuna attivita corrispondente trovata...",
        restore_backup_error: "Impossibile ripristinare il backup. Nessun backup trovato o file non valido."
    },
    ar: {
        menu: "القائمة",
        export: "تصدير",
        import: "استيراد",
        restore_backup: "استعادة النسخة الاحتياطية",
        settings: "الإعدادات",
        language: "اللغة",
        summary: "الملخص *",
        task_stage: "مرحلة المهمة",
        done: "مكتمل",
        hidden: "مخفي",
        due_date: "تاريخ الاستحقاق",
        priority: "الأولوية",
        notes: "ملاحظات",
        save: "حفظ",
        delete: "حذف",
        cancel: "إلغاء",
        search: "بحث",
        back_to_tasks: "العودة إلى عرض المهام",
        current_tasks: "المهام الحالية",
        ongoing: "قيد التنفيذ",
        backlog: "المهام المؤجلة",
        stage_current: "حالية",
        stage_ongoing: "قيد التنفيذ",
        stage_backlog: "مؤجلة",
        priority_none: "لا شيء",
        priority_low: "منخفض",
        priority_medium: "متوسط",
        priority_high: "مرتفع",
        no_due_date: "لا يوجد تاريخ استحقاق",
        no_matching_tasks: "لم يتم العثور على مهام مطابقة...",
        restore_backup_error: "تعذر استعادة النسخة الاحتياطية. لا توجد نسخة أو الملف غير صالح."
    },
    fa: {
        menu: "منو",
        export: "خروجی",
        import: "ورودی",
        restore_backup: "بازیابی پشتیبان",
        settings: "تنظیمات",
        language: "زبان",
        summary: "خلاصه *",
        task_stage: "مرحله کار",
        done: "انجام شد",
        hidden: "پنهان",
        due_date: "تاریخ سررسید",
        priority: "اولویت",
        notes: "یادداشت",
        save: "ذخیره",
        delete: "حذف",
        cancel: "لغو",
        search: "جستجو",
        back_to_tasks: "بازگشت به نمای کارها",
        current_tasks: "کارهای فعلی",
        ongoing: "در حال انجام",
        backlog: "پشت صف",
        stage_current: "فعلی",
        stage_ongoing: "در حال انجام",
        stage_backlog: "پشت صف",
        priority_none: "هیچ",
        priority_low: "کم",
        priority_medium: "متوسط",
        priority_high: "زیاد",
        no_due_date: "بدون تاریخ سررسید",
        no_matching_tasks: "هیچ کار مطابقی پیدا نشد...",
        restore_backup_error: "بازیابی پشتیبان ممکن نشد. پشتیبان پیدا نشد یا فایل نامعتبر است."
    },
    pt: {
        menu: "Menu",
        export: "Exportar",
        import: "Importar",
        restore_backup: "Restaurar backup",
        settings: "Configuracoes",
        language: "Idioma",
        summary: "Resumo *",
        task_stage: "Etapa da tarefa",
        done: "Concluida",
        hidden: "Oculta",
        due_date: "Data de vencimento",
        priority: "Prioridade",
        notes: "Notas",
        save: "Salvar",
        delete: "Excluir",
        cancel: "Cancelar",
        search: "Pesquisar",
        back_to_tasks: "Voltar para a lista",
        current_tasks: "Tarefas atuais",
        ongoing: "Em andamento",
        backlog: "Pendencias",
        stage_current: "Atual",
        stage_ongoing: "Em andamento",
        stage_backlog: "Pendencias",
        priority_none: "Nenhuma",
        priority_low: "Baixa",
        priority_medium: "Media",
        priority_high: "Alta",
        no_due_date: "Sem data de vencimento",
        no_matching_tasks: "Nenhuma tarefa correspondente encontrada...",
        restore_backup_error: "Nao foi possivel restaurar o backup. Nenhum backup encontrado ou arquivo invalido."
    },
    hi: {
        menu: "मेनू",
        export: "निर्यात",
        import: "आयात",
        restore_backup: "बैकअप पुनर्स्थापित करें",
        settings: "सेटिंग्स",
        language: "भाषा",
        summary: "सारांश *",
        task_stage: "कार्य चरण",
        done: "पूर्ण",
        hidden: "छिपा हुआ",
        due_date: "नियत तिथि",
        priority: "प्राथमिकता",
        notes: "टिप्पणियां",
        save: "सहेजें",
        delete: "हटाएं",
        cancel: "रद्द करें",
        search: "खोजें",
        back_to_tasks: "कार्य दृश्य पर वापस जाएं",
        current_tasks: "वर्तमान कार्य",
        ongoing: "प्रगति में",
        backlog: "बैकलॉग",
        stage_current: "वर्तमान",
        stage_ongoing: "प्रगति में",
        stage_backlog: "बैकलॉग",
        priority_none: "कोई नहीं",
        priority_low: "कम",
        priority_medium: "मध्यम",
        priority_high: "उच्च",
        no_due_date: "कोई नियत तिथि नहीं",
        no_matching_tasks: "कोई मेल खाती कार्य नहीं मिली...",
        restore_backup_error: "बैकअप पुनर्स्थापित नहीं हो सका। बैकअप नहीं मिला या फाइल अमान्य है।"
    },
    uk: {
        menu: "Меню",
        export: "Експорт",
        import: "Імпорт",
        restore_backup: "Відновити резервну копію",
        settings: "Налаштування",
        language: "Мова",
        summary: "Підсумок *",
        task_stage: "Етап задачі",
        done: "Виконано",
        hidden: "Приховано",
        due_date: "Термін",
        priority: "Пріоритет",
        notes: "Нотатки",
        save: "Зберегти",
        delete: "Видалити",
        cancel: "Скасувати",
        search: "Пошук",
        back_to_tasks: "Назад до задач",
        current_tasks: "Поточні задачі",
        ongoing: "У процесі",
        backlog: "Беклог",
        stage_current: "Поточні",
        stage_ongoing: "У процесі",
        stage_backlog: "Беклог",
        priority_none: "Немає",
        priority_low: "Низький",
        priority_medium: "Середній",
        priority_high: "Високий",
        no_due_date: "Без терміну",
        no_matching_tasks: "Відповідних задач не знайдено...",
        restore_backup_error: "Не вдалося відновити резервну копію. Копію не знайдено або файл недійсний."
    },
    ja: {
        menu: "メニュー",
        export: "エクスポート",
        import: "インポート",
        restore_backup: "バックアップを復元",
        settings: "設定",
        language: "言語",
        summary: "概要 *",
        task_stage: "タスク段階",
        done: "完了",
        hidden: "非表示",
        due_date: "期限",
        priority: "優先度",
        notes: "メモ",
        save: "保存",
        delete: "削除",
        cancel: "キャンセル",
        search: "検索",
        back_to_tasks: "タスク表示に戻る",
        current_tasks: "現在のタスク",
        ongoing: "進行中",
        backlog: "バックログ",
        stage_current: "現在",
        stage_ongoing: "進行中",
        stage_backlog: "バックログ",
        priority_none: "なし",
        priority_low: "低",
        priority_medium: "中",
        priority_high: "高",
        no_due_date: "期限なし",
        no_matching_tasks: "一致するタスクが見つかりません...",
        restore_backup_error: "バックアップを復元できませんでした。バックアップがないか、ファイルが無効です。"
    },
    ko: {
        menu: "메뉴",
        export: "내보내기",
        import: "가져오기",
        restore_backup: "백업 복원",
        settings: "설정",
        language: "언어",
        summary: "요약 *",
        task_stage: "작업 단계",
        done: "완료",
        hidden: "숨김",
        due_date: "마감일",
        priority: "우선순위",
        notes: "메모",
        save: "저장",
        delete: "삭제",
        cancel: "취소",
        search: "검색",
        back_to_tasks: "작업 보기로 돌아가기",
        current_tasks: "현재 작업",
        ongoing: "진행 중",
        backlog: "백로그",
        stage_current: "현재",
        stage_ongoing: "진행 중",
        stage_backlog: "백로그",
        priority_none: "없음",
        priority_low: "낮음",
        priority_medium: "중간",
        priority_high: "높음",
        no_due_date: "마감일 없음",
        no_matching_tasks: "일치하는 작업을 찾을 수 없습니다...",
        restore_backup_error: "백업을 복원할 수 없습니다. 백업이 없거나 파일이 올바르지 않습니다."
    }
};

function t(key) {
    const lang = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    return lang[key] || TRANSLATIONS.en[key] || key;
}

function getLocalizedStageLabel(stage) {
    return t("stage_" + stage);
}

function mapPriorityForDisplay(priorityNumber) {
    switch (priorityNumber) {
        case 0:
            return t("priority_none");
        case 1:
            return t("priority_low");
        case 2:
            return t("priority_medium");
        case 3:
            return t("priority_high");
        default:
            return t("priority_none");
    }
}

function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function toggleSettingsPanel() {
    const settingsPanel = document.getElementById("settings-panel");
    if (settingsPanel) {
        settingsPanel.classList.toggle("hidden");
    }
}

function openSearchHelp() {
    const modal = document.getElementById("search-help-modal");
    if (modal) {
        modal.classList.remove("hidden");
    }
}

function closeSearchHelp() {
    const modal = document.getElementById("search-help-modal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

function initSearchHelpPopup() {
    const content = document.getElementById("search-help-content");
    const modal = document.getElementById("search-help-modal");
    if (content) {
        // Keep docs bundled in the app so help works in file:// mode.
        content.innerHTML = SEARCH_HELP_HTML;
    }

    if (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeSearchHelp();
            }
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSearchHelp();
        }
    });
}

function applyTranslations() {
    setText("menu-toggle-label", t("menu"));
    setText("menu-export-link", t("export"));
    setText("menu-import-link", t("import"));
    setText("menu-restore-link", t("restore_backup"));
    setText("menu-settings-link", t("settings"));
    setText("settings-language-label", t("language"));
    setText("settings-theme-label", t("theme"));
    setText("theme-option-default", t("theme_default"));
    setText("theme-option-dark", t("theme_dark"));
    setText("theme-option-high-contrast", t("theme_high_contrast"));
    setText("theme-option-ocean", t("theme_ocean"));
    setText("theme-option-sepia", t("theme_sepia"));
    setText("label-task", t("summary"));
    setText("stage-label", t("task_stage"));
    setText("label-status", t("done"));
    setText("label-display", t("hidden"));
    setText("label-due", t("due_date"));
    setText("label-priority", t("priority"));
    setText("label-notes", t("notes"));
    setText("save-button", t("save"));
    setText("delete-button", t("delete"));
    setText("cancel-button", t("cancel"));
    setText("search-button", t("search"));
    setText("back-button", t("back_to_tasks"));
    setText("column-current", t("current_tasks"));
    setText("column-ongoing", t("ongoing"));
    setText("column-backlog", t("backlog"));
    setText("priority-option-0", t("priority_none"));
    setText("priority-option-1", t("priority_low"));
    setText("priority-option-2", t("priority_medium"));
    setText("priority-option-3", t("priority_high"));

    const stageDisplay = document.getElementById("stage-display");
    if (stageDisplay && stageDisplay.dataset.stage) {
        stageDisplay.innerText = getLocalizedStageLabel(stageDisplay.dataset.stage);
    }
}

function applyDirection() {
    const dir = RTL_LANGUAGES.has(currentLanguage) ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
}

function changeLanguage(languageCode) {
    if (!TRANSLATIONS[languageCode]) {
        return;
    }

    currentLanguage = languageCode;
    localStorage.setItem(UI_LANGUAGE_KEY, currentLanguage);
    document.documentElement.lang = currentLanguage;

    applyDirection();
    applyTranslations();

    if (dbobject) {
        if (displayMode === "search") {
            searchHandler();
        } else {
            displayTasks(dbobject);
        }
    }
}

function initLanguageSettings() {
    const savedLanguage = localStorage.getItem(UI_LANGUAGE_KEY);
    const initialLanguage = savedLanguage && TRANSLATIONS[savedLanguage] ? savedLanguage : "en";
    const languageSelect = document.getElementById("language-select");

    if (languageSelect) {
        languageSelect.value = initialLanguage;
    }

    changeLanguage(initialLanguage);
}

function applyTheme() {
    const classesToRemove = [];
    for (const themeName of AVAILABLE_THEMES) {
        classesToRemove.push("theme-" + themeName);
    }
    document.body.classList.remove(...classesToRemove);
    document.body.classList.add("theme-" + currentTheme);
}

function changeTheme(themeCode) {
    if (!AVAILABLE_THEMES.has(themeCode)) {
        return;
    }

    currentTheme = themeCode;
    localStorage.setItem(UI_THEME_KEY, currentTheme);

    const themeSelect = document.getElementById("theme-select");
    if (themeSelect && themeSelect.value !== currentTheme) {
        themeSelect.value = currentTheme;
    }

    applyTheme();
}

function initThemeSettings() {
    const savedTheme = localStorage.getItem(UI_THEME_KEY);
    const initialTheme = savedTheme && AVAILABLE_THEMES.has(savedTheme) ? savedTheme : "default";
    const themeSelect = document.getElementById("theme-select");

    if (themeSelect) {
        themeSelect.value = initialTheme;
    }

    changeTheme(initialTheme);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function getStageNameFromArea(areaElement) {
    return areaElement.id.replace("-tasks", "");
}

function getTaskKeyFromElement(taskElement) {
    return parseInt(taskElement.id.replace("task-", ""));
}

function getDragAfterElement(container, y, draggedElementId) {
    const draggableElements = [...container.querySelectorAll('.task')]
        .filter(el => el.id !== draggedElementId);

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return {offset: offset, element: child};
        }
        return closest;
    }, {offset: Number.NEGATIVE_INFINITY, element: null}).element;
}

function persistStageOrder(stageName) {
    return new Promise((resolve, reject) => {
        const stageArea = document.getElementById(stageName + "-tasks");
        if (!stageArea) {
            resolve();
            return;
        }

        const taskElements = [...stageArea.querySelectorAll('.task')];
        const transaction = dbobject.transaction(['tasks'], 'readwrite');
        const objectstore = transaction.objectStore('tasks');

        transaction.oncomplete = function () {
            resolve();
        };
        transaction.onerror = function (event) {
            reject(event);
        };

        taskElements.forEach((taskElement, order) => {
            const taskKey = getTaskKeyFromElement(taskElement);
            const getRequest = objectstore.get(taskKey);
            getRequest.onsuccess = function (successEvent) {
                const taskDataUpdate = successEvent.target.result;
                if (!taskDataUpdate) {
                    return;
                }

                taskDataUpdate.stage = stageName;
                taskDataUpdate.sort_order = order;
                objectstore.put(taskDataUpdate, taskKey);
            };
        });
    });
}

async function persistTaskOrderForStages(stageNames) {
    const uniqueStages = [...new Set(stageNames.filter(Boolean))];
    for (const stageName of uniqueStages) {
        await persistStageOrder(stageName);
    }
    scheduleBackup();
}

function getNextSortOrderForStage(stageName) {
    return new Promise((resolve, reject) => {
        let maxSortOrder = -1;
        const transaction = dbobject.transaction(['tasks'], 'readonly');
        const objectstore = transaction.objectStore('tasks');
        const stageIndex = objectstore.index('stage');
        const request = stageIndex.openCursor(IDBKeyRange.only(stageName), 'next');

        request.onerror = function (event) {
            reject(event);
        };

        request.onsuccess = function (successEvent) {
            const cursor = successEvent.target.result;
            if (cursor) {
                const parsedSort = Number(cursor.value.sort_order);
                const currentSort = Number.isFinite(parsedSort) ? parsedSort : -1;
                if (currentSort > maxSortOrder) {
                    maxSortOrder = currentSort;
                }
                cursor.continue();
            } else {
                resolve(maxSortOrder + 1);
            }
        };
    });
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    draggedTaskId = ev.target.id;
    if (ev.target.parentElement && ev.target.parentElement.classList.contains("task-area")) {
        draggedFromStage = getStageNameFromArea(ev.target.parentElement);
    } else {
        draggedFromStage = null;
    }
}

function dragEnd() {
    draggedTaskId = null;
    draggedFromStage = null;
}

function drop(ev, el) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    if (!draggedElement) {
        return;
    }

    const afterElement = getDragAfterElement(el, ev.clientY, data);
    if (afterElement === null) {
        el.appendChild(draggedElement);
    } else {
        el.insertBefore(draggedElement, afterElement);
    }

    const droppedToStage = getStageNameFromArea(el);
    persistTaskOrderForStages([draggedFromStage, droppedToStage]).catch(function (error) {
        console.log("Drop ordering persist failed!", error);
    }).finally(function () {
        dragEnd();
    });
}

function handleTaskAreaDragOver(ev, el) {
    ev.preventDefault();
    if (!draggedTaskId) {
        return;
    }

    const draggedElement = document.getElementById(draggedTaskId);
    if (!draggedElement) {
        return;
    }

    const afterElement = getDragAfterElement(el, ev.clientY, draggedTaskId);
    if (afterElement === null) {
        el.appendChild(draggedElement);
    } else {
        el.insertBefore(draggedElement, afterElement);
    };
}


let taskareas = document.getElementsByClassName("task-area");
for (let el of taskareas) {
    el.addEventListener("drop", function (ev) {
        drop(ev, el)
    }, false);
    el.addEventListener("dragover", function (ev) {
        handleTaskAreaDragOver(ev, el);
    }, false);
}


function resetForm() {
    'use strict';
    const today = utils.yyyymmdd();
    window.location.hash = '';
    /*
    Reset add new form because some browsers like
    to hold on to that form data.
    */
    addNew.reset();

    /*
    Reset the key value, since reset() doesn't work on
    hidden fields
    */
    addNew.key.value = '';
    addNew.sort_order.value = '';
    addNew.old_stage.value = '';

    /* Set default start, due dates */
    //addNew.due.value = today;
}

/* Global error handler message */
errorHandler = function (errorevt) {
    console.error(errorevt.target.error.message);
    console.log('error');
    console.log(errorevt);
};

timestamp = function (datefield) {
    if (!isNaN(datefield.valueAsNumber)) {
        return datefield.valueAsNumber;
    } else {
        return new Date(datefield.value).getTime();
    }
};

/* 
Fired on page load. Creates the database and indexes if it
doesn't exist. Displays existing tasks if there are any.
*/
init = function () {
    'use strict';

    idb = indexedDB.open('IDBTaskList', 4);

    idb.onupgradeneeded = function (evt) {
        let tasks, transaction;

        dbobject = evt.target.result;

        if (evt.oldVersion < 1) {
            tasks = dbobject.createObjectStore('tasks', {autoIncrement: true});
            transaction = evt.target.transaction.objectStore('tasks');
            transaction.createIndex('by_task', 'task');
            transaction.createIndex('priority', 'priority');
            transaction.createIndex('status', 'status');
            transaction.createIndex('due', 'due');
            transaction.createIndex('resolved', 'resolved');
            transaction.createIndex('stage', 'stage');
            transaction.createIndex('display', 'display');
        }

        if (evt.oldVersion < 4) {
            transaction = evt.target.transaction.objectStore('tasks');
            if (!transaction.indexNames.contains('sort_order')) {
                transaction.createIndex('sort_order', 'sort_order');
            }
        }
    };

    idb.onsuccess = function (event) {
        if (dbobject === undefined) {
            dbobject = event.target.result;
        }
        displayTasks(dbobject);
    };
};

function exportToJson(idbDatabase) {
    return new Promise((resolve, reject) => {
        const exportObject = {}
        if (idbDatabase.objectStoreNames.length === 0) {
            resolve(JSON.stringify(exportObject))
        } else {
            const transaction = idbDatabase.transaction(
                idbDatabase.objectStoreNames,
                'readonly'
            )

            transaction.addEventListener('error', reject)

            for (const storeName of idbDatabase.objectStoreNames) {
                const allObjects = []
                transaction
                    .objectStore(storeName)
                    .openCursor()
                    .addEventListener('success', event => {
                        const cursor = event.target.result
                        if (cursor) {
                            // Cursor holds value, put it into store data
                            allObjects.push(cursor.value)
                            cursor.continue()
                        } else {
                            // No more values, store is done
                            exportObject[storeName] = allObjects

                            // Last store was handled
                            if (
                                idbDatabase.objectStoreNames.length ===
                                Object.keys(exportObject).length
                            ) {
                                resolve(JSON.stringify(exportObject))
                            }
                        }
                    })
            }
        }
    })
}

function importFromJson(idbDatabase, json) {
    return new Promise((resolve, reject) => {
        const transaction = idbDatabase.transaction(
            idbDatabase.objectStoreNames,
            'readwrite'
        )
        transaction.addEventListener('error', reject)

        var importObject = JSON.parse(json)
        for (const storeName of idbDatabase.objectStoreNames) {
            let count = 0
            for (const toAdd of importObject[storeName]) {
                const request = transaction.objectStore(storeName).add(toAdd)
                request.addEventListener('success', () => {
                    count++
                    if (count === importObject[storeName].length) {
                        // Added all objects for this store
                        delete importObject[storeName]
                        if (Object.keys(importObject).length === 0) {
                            // Added all object stores
                            resolve()
                        }
                    }
                })
            }
        }
    })
}


async function readFile(event) {
    await importFromJson(dbobject, event.target.result);
    await backupData();
    location.reload();
}

function processFile(files){
    if(files !== null) {
        let reader = new FileReader();
        reader.addEventListener('load', readFile);
        reader.readAsText(files[0]);
        this.value = null;
    } else {
        console.log("No files were selected!");
    }
}

async function importData(){
    let input = document.querySelector('input[type=file]');
    input.click();
}

async function exportData() {
    let exported = await exportToJson(dbobject);
    const a = document.createElement('a');
    const blob = new Blob([exported]);
    a.href = URL.createObjectURL(blob);
    a.download = 'taskDB.json';
    a.click();
}

function supportsOpfs() {
    return !!(navigator.storage && navigator.storage.getDirectory);
}

function shouldUseLocalStorageBackup() {
    return window.location.protocol === "file:";
}

function writeBackupToLocalStorage(data) {
    localStorage.setItem(LOCALSTORAGE_BACKUP_KEY, data);
}

function readBackupFromLocalStorage() {
    const backupData = localStorage.getItem(LOCALSTORAGE_BACKUP_KEY);
    if (backupData === null) {
        throw new Error("No backup found in localStorage.");
    }
    return backupData;
}

async function writeBackupToOpfs(data) {
    if (!supportsOpfs()) {
        console.warn("OPFS is not supported in this browser. Skipping backup.");
        return;
    }

    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(OPFS_BACKUP_FILE_NAME, {create: true});
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
}

async function readBackupFromOpfs() {
    if (!supportsOpfs()) {
        throw new Error("OPFS is not supported in this browser.");
    }

    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(OPFS_BACKUP_FILE_NAME);
    const file = await fileHandle.getFile();
    return file.text();
}

async function writeBackup(data) {
    if (shouldUseLocalStorageBackup()) {
        writeBackupToLocalStorage(data);
        return;
    }

    if (supportsOpfs()) {
        await writeBackupToOpfs(data);
        return;
    }

    // Non-file contexts without OPFS support still get a local backup fallback.
    console.warn("OPFS is not supported. Falling back to localStorage backup.");
    writeBackupToLocalStorage(data);
}

async function readBackup() {
    if (shouldUseLocalStorageBackup()) {
        return readBackupFromLocalStorage();
    }

    if (supportsOpfs()) {
        return readBackupFromOpfs();
    }

    console.warn("OPFS is not supported. Trying localStorage backup.");
    return readBackupFromLocalStorage();
}

async function backupData() {
    try {
        const exported = await exportToJson(dbobject);
        await writeBackup(exported);
    } catch (error) {
        console.error("Automatic backup failed", error);
    }
}

function scheduleBackup() {
    if (backupDebounceTimer !== null) {
        window.clearTimeout(backupDebounceTimer);
    }

    // Batch quick consecutive edits into a single backup write.
    backupDebounceTimer = window.setTimeout(function () {
        backupDebounceTimer = null;
        backupData();
    }, 500);
}

async function replaceFromJson(idbDatabase, json) {
    return new Promise((resolve, reject) => {
        const importObject = JSON.parse(json);
        const transaction = idbDatabase.transaction(
            idbDatabase.objectStoreNames,
            'readwrite'
        );

        transaction.addEventListener('error', reject);
        transaction.addEventListener('complete', resolve);

        for (const storeName of idbDatabase.objectStoreNames) {
            const store = transaction.objectStore(storeName);
            store.clear();

            if (importObject[storeName] && importObject[storeName].length > 0) {
                for (const toAdd of importObject[storeName]) {
                    store.add(toAdd);
                }
            }
        }
    });
}

async function restoreBackup() {
    try {
        const backupJson = await readBackup();
        await replaceFromJson(dbobject, backupJson);

        if (displayMode === 'search') {
            location.reload();
        } else {
            displayTasks(dbobject);
        }
    } catch (error) {
        console.error("Restore backup failed", error);
        alert(t("restore_backup_error"));
    }
}


function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/* Retrieves and displays the list of tasks */
displayTasks = function (database) {
    'use strict';

    let transaction, objectstore, request;
    const stages = {
        current: [],
        ongoing: [],
        backlog: []
    };

    removeAllChildNodes(currenttasksbox);
    removeAllChildNodes(ongoingtasksbox);
    removeAllChildNodes(backlogtasksbox);

    transaction = dbobject.transaction(['tasks'], 'readonly');
    objectstore = transaction.objectStore('tasks');

    request = objectstore.openCursor(IDBKeyRange.lowerBound(0), 'next');

    request.onsuccess = function (successevent) {
        let cursor;
        cursor = request.result;
        if (cursor) {
            const stageName = stages[cursor.value.stage] ? cursor.value.stage : 'backlog';
            stages[stageName].push({
                primaryKey: cursor.primaryKey,
                value: cursor.value
            });
            cursor.continue();
            return;
        }

        const stageContainers = {
            current: currenttasksbox,
            ongoing: ongoingtasksbox,
            backlog: backlogtasksbox
        };

        for (const stageName of Object.keys(stages)) {
            const sortedTasks = stages[stageName].sort(function (a, b) {
                const aOrder = Number.isFinite(a.value.sort_order) ? a.value.sort_order : Number.MAX_SAFE_INTEGER;
                const bOrder = Number.isFinite(b.value.sort_order) ? b.value.sort_order : Number.MAX_SAFE_INTEGER;
                if (aOrder !== bOrder) {
                    return aOrder - bOrder;
                }
                return (a.value.task || '').localeCompare((b.value.task || ''));
            });

            const docfrag = document.createDocumentFragment();
            for (const taskRecord of sortedTasks) {
                docfrag.appendChild(buildTask(taskRecord));
            }
            stageContainers[stageName].appendChild(docfrag);
        }
    };
};

buildTask = function (recordobject) {
    'use strict';
    let div, status, record, p;
    div = document.createElement('div');
    div.setAttribute('class', 'task');
    div.setAttribute('id', 'task-' + recordobject.primaryKey);

    record = recordobject.value;
    record.primaryKey = recordobject.primaryKey;

    if (record.due && record.due < Date.now() && record.status === "open") {
        div.classList.add("overdue");
    }

    if (record) {
        // status
        status = addCheckbox(recordobject.primaryKey, record.status === "done");
        div.appendChild(status);

        // task
        p = document.createElement('p');
        p.setAttribute('data-recordid', record.primaryKey);
        p.setAttribute('class', 'task-title');
        p.classList.add("dont-break-out");
        p.innerText = record.task;
        div.appendChild(p);

        // edit button
        let editButton = document.createElement("button");
        editButton.innerText = "E";
        editButton.setAttribute("class", "edit-button");
        editButton.addEventListener('click', function () {
            editHandler(record.primaryKey);
        });
        div.appendChild(editButton);

        // priority
        p = document.createElement('p');
        p.setAttribute('class', 'task-priority');
        p.innerText = mapPriorityForDisplay(record.priority);
        div.appendChild(p);

        // hide button
        let hideButton = document.createElement("button");
        hideButton.innerText = "H";
        hideButton.setAttribute("class", "hide-button");
        hideButton.addEventListener('click', function () {
            hideHandler(record.primaryKey);
        });
        div.appendChild(hideButton);

        // due date
        p = document.createElement('p');
        p.setAttribute('class', 'task-due');
        if (record.due) {
            p.innerText = new Date(record.due).toDateString();
        } else {
            p.innerText = t("no_due_date");
        }
        div.appendChild(p);

        const ticketRow = document.createElement('div');
        ticketRow.setAttribute('class', 'task-ticket-row');

        const ticketNeeded = document.createElement('p');
        ticketNeeded.setAttribute('class', 'task-ticket-needed');
        ticketNeeded.innerText = "Ticket needed: " + (!!record.ticket_needed);
        ticketRow.appendChild(ticketNeeded);

        const ticketReferenceField = document.createElement('p');
        ticketReferenceField.setAttribute('class', 'task-ticket-reference');
        const ticketReference = (record.ticket_reference || "").trim();
        if (!ticketReference) {
            ticketReferenceField.innerText = "Ticket reference: -";
        } else {
            let isUrl = false;
            try {
                const parsedUrl = new URL(ticketReference);
                isUrl = ["http:", "https:"].includes(parsedUrl.protocol);
            } catch (error) {
                isUrl = false;
            }

            if (isUrl) {
                ticketReferenceField.appendChild(document.createTextNode("Ticket reference: "));
                const link = document.createElement('a');
                link.href = ticketReference;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.innerText = ticketReference;
                ticketReferenceField.appendChild(link);
            } else {
                ticketReferenceField.innerText = "Ticket reference: " + ticketReference;
            }
        }
        ticketRow.appendChild(ticketReferenceField);
        div.appendChild(ticketRow);

        // display or hidden
        if (!record.display) {
            div.classList.add("hidden");
        }

        // add drag event handlers
        div.setAttribute("draggable", "true");
        div.addEventListener("dragstart", drag, false);
        div.addEventListener("dragend", dragEnd, false);

        return div;
    }
};

addCheckbox = function (id, checked) {
    'use strict';
    let status = document.createElement('input');
    status.type = 'checkbox';
    status.id = id;
    status.checked = checked;
    status.setAttribute('class', 'task-status');
    status.addEventListener("change", updateStatus);
    return status;
};

addNewHandler = function (evt) {
    'use strict';
    evt.preventDefault();

    let entry = {}, transaction, objectstore, request, fields = document.getElementById('addNew'), results;

    /* Build our task object */
    entry.task = fields.task.value;

    /* If there's a date, save as time stamps instead of date strings. */
    entry.due = fields.due.value === '' ? null : timestamp(fields.due);

    /*  Convert to number */
    entry.priority = +fields.priority.value;
    entry.ticket_needed = fields.ticket_needed.checked;
    entry.ticket_reference = fields.ticket_reference.value.trim();
    entry.notes = fields.notes.value;
    entry.status = fields.status.checked ? "done" : "open";
    entry.stage = document.getElementById('stage-display').dataset.stage || document.getElementById('stage-display').innerText;
    entry.resolved = null;
    if (fields.status.checked) {
        console.log("Resolved val:");
        console.log(+fields.resolved.value);
        if (fields.resolved.value) {
            entry.resolved = +fields.resolved.value;
        } else {
            entry.resolved = Date.now();
        }
    }
    entry.display = !fields.display.checked;

    const savedSortOrder = fields.sort_order.value !== '' ? +fields.sort_order.value : null;
    const oldStage = fields.old_stage.value;

    if (fields.key.value && savedSortOrder !== null && oldStage === entry.stage) {
        entry.sort_order = savedSortOrder;
        continueSave();
    } else {
        getNextSortOrderForStage(entry.stage).then(function (nextOrder) {
            entry.sort_order = nextOrder;
            continueSave();
        }).catch(function () {
            entry.sort_order = Date.now();
            continueSave();
        });
    }

    function continueSave() {
    console.log(entry);

    transaction = dbobject.transaction(['tasks'], 'readwrite');
    objectstore = transaction.objectStore('tasks');

    if (fields.key.value) {
        // Update existing task
        request = objectstore.put(entry, +fields.key.value);
    } else {
        // Add new task
        request = objectstore.add(entry);
    }
    /*
    Returns ID of last addition / update. Not necessary for
    this application. Here to show that it can be done.
    */
    request.onsuccess = function (evt) {
        results = request.result;
    };


    transaction.oncomplete = function (evt) {
        hideNewForm();
        if (displayMode === 'search') {
            searchHandler();
        } else {
            displayTasks(dbobject);
        }
        resetForm();
        scheduleBackup();
    };

    transaction.onerror = errorHandler;
    }
};

updateStatus = function (evt) {
    'use strict';
    if (evt.target.nodeName === 'INPUT') {

        let transaction, objectstore, request, key = +evt.target.id;
        let taskDiv = document.getElementById("task-" + key);

        transaction = dbobject.transaction(['tasks'], 'readwrite');
        objectstore = transaction.objectStore('tasks');
        transaction.oncomplete = function () {
            scheduleBackup();
        };

        request = objectstore.get(key);

        request.onsuccess = function (reqevt) {
            if (+evt.target.checked) {
                reqevt.target.result.status = "done";
                reqevt.target.result.resolved = +new Date();
                taskDiv.classList.remove("overdue");
            } else {
                reqevt.target.result.status = "open";
                reqevt.target.result.resolved = null;
                if(reqevt.target.result.due && reqevt.target.result.due < Date.now()){
                    taskDiv.classList.add("overdue");
                }
            }
            objectstore.put(reqevt.target.result, key);
        };
    }
};

function mapPriority(priorityNumber) {
    switch (priorityNumber) {
        case 0:
            return "none";
        case 1:
            return "low";
        case 2:
            return "medium";
        case 3:
            return "high";
        default:
            return "none";
    }
}

function evaluateStatement(statement, record) {
    if (Array.isArray(statement)) {
        const left = evaluateStatement(statement[1], record);
        let right = evaluateStatement(statement[2], record);
        if (["due", "resolved"].includes(statement[1])) {
            if (left === undefined || left === null || left === "") {
                /* Invalid due dates should not be found */
                return false;
            }
            /* has to be a date string in this case */
            right = Date.parse(statement[2]);
        } else if (statement[1] === "priority") {
            /* has to be a priority string in this case */
            right = right.toLowerCase();
        } else if (statement[1] === "id") {
            /* has to be a number in this case */
            right = parseInt(right);
        }
        switch (statement[0]) {
            case "=":
                return left === right;
            case "!=":
                return left !== right;
            case "~":
                return left.includes(right);
            case "!~":
                return !left.includes(right);
            case "<":
                return left < right;
            case ">":
                return left > right;
            case "and":
                return left && right;
            case "or":
                return left || right;
        }
    } else {
        switch (statement) {
            case "due":
                return record.value.due;
            case "resolved":
                return record.value.resolved;
            case "id":
                return record.primaryKey;
            case "title":
                return record.value.task;
            case "notes":
                return record.value.notes;
            case "ticket_reference":
                return record.value.ticket_reference || "";
            case "priority":
                return mapPriority(record.value.priority);
            case "stage":
                return record.value.stage;
            case "hidden":
                return !record.value.display;
            case "done":
                return (record.value.status !== "open");
            case "ticket_needed":
                return !!record.value.ticket_needed;
            default:
                return statement;
        }
    }
    return false;
}

searchHandler = function () {
    'use strict';
    let transaction, objectstore, index, request, list, query, found = false,
        docfrag = document.createDocumentFragment();
    list = document.getElementById("list");
    query = document.getElementById("find").value;

    /* Change display mode */
    displayMode = 'search';

    /* Clear the list */
    list.innerHTML = '';

    /* Display back button */
    backbtn.classList.remove("hidden");

    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    try {
        if (query) {
            parser.feed(query);
            if (parser.results.length !== 1) {
                console.log("Ambiguous search query");
                return;
            }
        }

        transaction = dbobject.transaction(['tasks'], 'readonly');
        objectstore = transaction.objectStore('tasks');
        index = objectstore.index('by_task');
        request = index.openCursor(IDBKeyRange.lowerBound(0), 'next');

        request.onsuccess = function (successevent) {
            let cursor, task;
            cursor = request.result;

            if (cursor !== null) {
                /* empty query -> matches all */
                if (!query || evaluateStatement(parser.results[0], cursor)) {
                    task = buildTask(cursor);
                    docfrag.appendChild(task);
                    found = true;
                } else {
                    console.log("Task " + cursor.primaryKey + " does not match.");
                }
                cursor.continue();
            }
            list.appendChild(docfrag);
        };

        transaction.oncomplete = function () {
            if (!found) {
                let resultMessage = document.createElement("p");
                resultMessage.innerText = t("no_matching_tasks");
                list.appendChild(resultMessage);
            } else {
                /* Make all hidden elements visible in the search results */
                let el;
                for (el of document.getElementsByClassName("task")) {
                    el.classList.remove("hidden");
                }
            }
        };
    } catch (err) {
        console.log("Invalid search query!");
    }
}
;

editHandler = function (taskId) {
    'use strict';
    let transaction, objectstore, request;

    if (taskId) {
        transaction = dbobject.transaction(['tasks'], 'readonly');
        objectstore = transaction.objectStore('tasks');
        request = objectstore.get(taskId);

        request.onsuccess = function (successevent) {
            showNewForm(successevent.target.result.stage, true);
            addNew.status.checked = successevent.target.result.status === "done";
            addNew.resolved.value = successevent.target.result.resolved;
            addNew.display.checked = !successevent.target.result.display;
            addNew.sort_order.value = Number.isFinite(Number(successevent.target.result.sort_order)) ? Number(successevent.target.result.sort_order) : '';
            addNew.old_stage.value = successevent.target.result.stage;

            addNew.key.value = taskId;
            addNew.task.value = successevent.target.result.task;

            successevent.target.result.due ? addNew.due.value =
                utils.yyyymmdd(new Date(successevent.target.result.due)) : addNew.due.value = '';

            addNew.priority.value = successevent.target.result.priority;
            addNew.ticket_needed.checked = !!successevent.target.result.ticket_needed;
            addNew.ticket_reference.value = successevent.target.result.ticket_reference || '';
            addNew.notes.value = successevent.target.result.notes;
        };
    }
};

hideHandler = function (taskId) {
    'use strict';
    let transaction, objectstore, request;

    transaction = dbobject.transaction(['tasks'], 'readwrite');
    objectstore = transaction.objectStore('tasks');
    request = objectstore.get(taskId);

    request.onsuccess = function (successevent) {
        successevent.target.result.display = false;
        objectstore.put(successevent.target.result, taskId);

        let taskDiv = document.getElementById("task-" + taskId);
        taskDiv.setAttribute("class", "hidden");
    };

    transaction.oncomplete = function () {
        scheduleBackup();
    };
};

deleteHandler = function (evt) {
    'use strict';
    let transaction, objectstore, request, key;
    key = +document.getElementById('addNew').key.value;

    transaction = dbobject.transaction(['tasks'], 'readwrite');
    objectstore = transaction.objectStore('tasks');
    request = objectstore.delete(key);

    /* Don't need to define an onsuccess function */
    request.onsuccess = function (successevent) {
        console.log("Deleted task " + key);
    };

    transaction.oncomplete = function (evt) {
        hideNewForm();
        displayTasks(dbobject);
        resetForm();
        scheduleBackup();
    };
    transaction.onerror = errorHandler;
};

sort = function (evt) {
    // todo: can be deleted?
    'use strict';
    let which, dir, docfrag = document.createDocumentFragment(), index, transaction, objectstore, request;

    /* Clear table body */
    currenttasksbox.innerHTML = '';

    /* Remove 'active' class from THs */
    Array.prototype.map.call(document.querySelectorAll('#list th'), function (th) {
        th.classList.remove('active');
    });

    if (evt.target.nodeName === 'TH') {
        evt.target.classList.add('active');

        switch (evt.target.innerHTML) {
            case 'Priority':
                which = 'priority';
                break;
            case 'Due':
                which = 'due';
                break;
            case 'Complete':
                which = 'status';
                break;
            case 'Task':
                which = 'by_task';
                break;
        }

        evt.target.classList.toggle('asc');

        dir = evt.target.classList.contains('asc') ? 'next' : 'prev';

        transaction = dbobject.transaction(['tasks'], 'readwrite');
        objectstore = transaction.objectStore('tasks');
        index = objectstore.index(which);
        request = index.openCursor(IDBKeyRange.lowerBound(0), dir);

        /* Clear table body */
        currenttasksbox.innerHTML = '';

        request.onsuccess = function (successevent) {
            let cursor, task;
            cursor = request.result;

            if (cursor !== null) {
                task = buildTask(cursor);
                docfrag.appendChild(task);
                cursor.continue();
            }
            if (docfrag.childNodes.length) {
                currenttasksbox.appendChild(docfrag);
            }
        };
    }
};

deletebtn.addEventListener('click', deleteHandler);
search.addEventListener('click', searchHandler);
document.getElementById("find").addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.code === "Enter") {
        event.preventDefault();
        // Trigger the button element with a click
        search.click();
    }
});
savebtn.addEventListener('click', addNewHandler);
backbtn.addEventListener('click', function () {
    location.reload();
});
initSearchHelpPopup();
initThemeSettings();
initLanguageSettings();
window.addEventListener('load', init);
