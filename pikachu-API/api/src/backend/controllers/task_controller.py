from src.database.models import db, Task

class TaskController:
    @staticmethod
    def get_all():
        return [task.to_dict() for task in Task.query.all()]

    @staticmethod
    def get_by_id(task_id):
        return Task.query.get(task_id)

    @staticmethod
    def create(data):
        task = Task(**data)
        db.session.add(task)
        db.session.commit()
        return task.to_dict()

    @staticmethod
    def update(task_id, data):
        task = Task.query.get(task_id)
        if task:
            for key, value in data.items():
                setattr(task, key, value)
            db.session.commit()
            return task.to_dict()
        return None

    @staticmethod
    def delete(task_id):
        task = Task.query.get(task_id)
        if task:
            db.session.delete(task)
            db.session.commit()
            return True
        return False