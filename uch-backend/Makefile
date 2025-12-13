.PHONY: run migrate makemigrations shell superuser test clean

run:
	python manage.py runserver

migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

shell:
	python manage.py shell

superuser:
	python manage.py createsuperuser

test:
	python manage.py test

clean:
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete