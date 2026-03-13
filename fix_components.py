import re

# 1. Fix Modals
def fix_modals():
    with open("src/views/recruitment/ExpelledStudentsPage.vue", "r") as f:
        content = f.read()
    
    # We need to add "relative" to the modal body div.
    # The modals divs are like `<div class="bg-app-card border border-[#788cff59] rounded-[16px] p-[26px]...`
    # Let's just find `rounded-[16px]` and make sure it has `relative`
    
    # regex to find the modal container div and add relative
    content = re.sub(
        r'(class="[^"]*rounded-\[16px\][^"]*)(")',
        lambda m: m.group(1) + ' relative' + m.group(2) if 'relative' not in m.group(1) else m.group(0),
        content
    )
    
    # 2. Fix the Table Row hot state
    # Replace:
    # :class="isHot(s) ? 'border-l-2 border-l-app-red bg-[rgba(239,68,68,0.03)]' : ''"
    # With:
    # :class="isHot(s) ? 'bg-[rgba(239,68,68,0.03)]' : ''"
    # :style="isHot(s) ? { boxShadow: 'inset 3px 0 0 #ef4444' } : {}"
    
    search_str = r":class=\"isHot\(s\) \? 'border-l-2 border-l-app-red bg-\[rgba\(239,68,68,0\.03\)\]' : ''\""
    replace_str = ":class=\"isHot(s) ? 'bg-[rgba(239,68,68,0.03)]' : ''\"\n            :style=\"isHot(s) ? { boxShadow: 'inset 3px 0 0 #ef4444' } : {}\""
    
    content = re.sub(search_str, replace_str, content)

    with open("src/views/recruitment/ExpelledStudentsPage.vue", "w") as f:
        f.write(content)

if __name__ == "__main__":
    fix_modals()
    print("Done")
