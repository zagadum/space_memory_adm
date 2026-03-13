import json

with open("src/locales/ru.json", "r") as f:
    data = json.load(f)

# The keys we need to add:
# expelled.bulk.selected
# expelled.actions.apply
# expelled.actions.archiveAll
# expelled.archiveTitle, expelled.archiveSub, expelled.archiveReason, expelled.archiveSpecify
# expelled.showing
# common.cancel, common.add (we'll check common)

if "common" not in data:
    data["common"] = {}
if "cancel" not in data["common"]:
    data["common"]["cancel"] = "Отмена"
if "add" not in data["common"]:
    data["common"]["add"] = "Добавить"

if "expelled" not in data:
    data["expelled"] = {}

if "bulk" not in data["expelled"]:
    data["expelled"]["bulk"] = {}

data["expelled"]["bulk"]["selected"] = "выбрано"

if "actions" not in data["expelled"]:
    data["expelled"]["actions"] = {}

data["expelled"]["actions"]["apply"] = "Применить"
data["expelled"]["actions"]["archiveAll"] = "Архивировать всех"

data["expelled"]["archiveTitle"] = "Архивация"
data["expelled"]["archiveSub"] = "Укажите причину для архивации"
data["expelled"]["archiveReason"] = "Причина"
data["expelled"]["archiveSpecify"] = "Уточните причину"
data["expelled"]["showing"] = "Показано {shown} из {total}"

with open("src/locales/ru.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

