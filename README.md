# Universal Creative Hub

Self-hosted creative platform combining blog/portfolio with interactive music studio.

## 🚀 Quick Start

### Development
```bash
# 1. Clone repository
git clone https://github.com/yourusername/UniversalCreativeHub.git
cd UniversalCreativeHub/uch-backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements-dev.txt

# 4. Run migrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Run server
python manage.py runserver