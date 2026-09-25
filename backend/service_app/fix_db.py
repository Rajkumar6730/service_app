import sys
sys.path.append('src')
from service_app.core.security import get_password_hash
from service_app.core.database import SessionLocal
from service_app.models.user import User

db = SessionLocal()
rama = db.query(User).filter(User.email == 'rama@gmai.com').first()
if rama:
    rama.email = 'rama@gmail.com'
    rama.password_hash = get_password_hash('password123')

raju = db.query(User).filter(User.email == 'raju@gmail.com').first()
if raju:
    raju.password_hash = get_password_hash('password123')

db.commit()
print('Updated emails and passwords!')
