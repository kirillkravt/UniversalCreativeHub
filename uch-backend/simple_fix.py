# Создай простой fixer

import sys

def fix_tabs(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Просто заменяем все табы на 4 пробела
    content = content.replace('\t', '    ')
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✅ Табы заменены на пробелы в: {filepath}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        fix_tabs(sys.argv[1])
    else:
        print("Использование: python simple_fix.py <filepath>")