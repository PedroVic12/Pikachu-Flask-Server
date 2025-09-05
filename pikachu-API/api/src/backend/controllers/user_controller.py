from src.database.models import db, User

class UserController:
    @staticmethod
    def get_all():
        return [user.to_dict() for user in User.query.all()]

    @staticmethod
    def get_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def create(data):
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return user.to_dict()

    @staticmethod
    def update(user_id, data):
        user = User.query.get(user_id)
        if user:
            for key, value in data.items():
                setattr(user, key, value)
            db.session.commit()
            return user.to_dict()
        return None

    @staticmethod
    def delete(user_id):
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return True
        return False