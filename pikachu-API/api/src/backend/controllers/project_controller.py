from src.database.models import db, Project

class ProjectController:
    @staticmethod
    def get_all():
        return [project.to_dict() for project in Project.query.all()]

    @staticmethod
    def get_by_id(project_id):
        return Project.query.get(project_id)

    @staticmethod
    def create(data):
        project = Project(**data)
        db.session.add(project)
        db.session.commit()
        return project.to_dict()

    @staticmethod
    def update(project_id, data):
        project = Project.query.get(project_id)
        if project:
            for key, value in data.items():
                setattr(project, key, value)
            db.session.commit()
            return project.to_dict()
        return None

    @staticmethod
    def delete(project_id):
        project = Project.query.get(project_id)
        if project:
            db.session.delete(project)
            db.session.commit()
            return True
        return False