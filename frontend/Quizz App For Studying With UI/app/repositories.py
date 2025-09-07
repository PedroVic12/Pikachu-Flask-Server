
from . import db
from .models import QuizSession

class QuizSessionRepository:
    @staticmethod
    def get_all_sessions():
        return QuizSession.query.order_by(QuizSession.timestamp.desc()).all()

    @staticmethod
    def add_session(score, total_questions, xp_gained):
        new_session = QuizSession(
            score=score,
            total_questions=total_questions,
            xp_gained=xp_gained
        )
        db.session.add(new_session)
        db.session.commit()
        return new_session
